const jwt = require("jsonwebtoken");
const db = require("../database/database");
const bcrypt = require("bcrypt");
const { OAuth2Client } = require("google-auth-library");
const {
  calculateLoginStreak,
  updateLoginAchievements,
} = require("../business/UserLogic");
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token === null) {
    return res.sendStatus(401);
  }
  jwt.verify(token, `${process.env.ACCESS_TOKEN_SECRET}`, (err, user) => {
    if (err) {
      return res.sendStatus(403);
    }
    req.user = user;
    next();
  });
};

const registerUser = async (req, res) => {
  const { name, email, password, height, weight } = req.body;
  const currDate = new Date();
  const newStreak = 1;
  if (!name || !email || !password || !height || !weight) {
    return res.status(400).json({ error: "Missing Fields." });
  }
  try {
    const userExists = await db.oneOrNone(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (userExists) {
      return res.status(400).json({ error: "Email already in use." });
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await db.one(
      "INSERT INTO users(name, email, password, height, weight, google_account, lastlogged, current_days) VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *",
      [name, email, hashedPassword, height, weight, false, currDate, newStreak]
    );

    const accessToken = jwt.sign(
      { data: newUser },
      `${process.env.ACCESS_TOKEN_SECRET}`
    );
    res.status(200).json({ token: accessToken, user: newUser });
  } catch (err) {
    return res.status(500).json({ error: "Unable to register user." });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  try {
    const user = await db.oneOrNone("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: "Incorrect password." });
    }

    await db.tx(async (t) => {
      const streak = calculateLoginStreak(user);
      const updatedUser = await t.one(
        "UPDATE users SET lastlogged = $1, current_days = $2 WHERE user_id = $3 RETURNING *",
        [new Date(), streak, user.user_id]
      );
      await updateLoginAchievements(updatedUser, t);
    });

    const accessToken = jwt.sign(
      { data: user },
      process.env.ACCESS_TOKEN_SECRET
    );
    res.status(200).json({ token: accessToken, user });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

const googleSignIn = async (req, res) => {
  try {
    const oAuth2Client = new OAuth2Client(
      process.env.CLIENT_ID,
      process.env.CLIENT_SECRET,
      "postmessage"
    );
    const { tokens } = await oAuth2Client.getToken(req.body.code);
    const decodedToken = jwt.decode(tokens.id_token);
    const { email, name } = decodedToken;

    const user = await db.oneOrNone("SELECT * FROM users WHERE email = $1", [email]);

    await db.tx(async (t) => {
      let updatedUser;
      if (user) {
        const streak = calculateLoginStreak(user);
        updatedUser = await t.one(
          "UPDATE users SET lastlogged = $1, current_days = $2 WHERE user_id = $3 RETURNING *",
          [new Date(), streak, user.user_id]
        );
      } else {
        updatedUser = await t.one(
          "INSERT INTO users(name, email, google_account, lastlogged, current_days) VALUES($1, $2, $3, $4, $5) RETURNING *",
          [name, email, true, new Date(), 1]
        );
      }
      await updateLoginAchievements(updatedUser, t);

      const accessToken = jwt.sign(
        { data: updatedUser },
        process.env.ACCESS_TOKEN_SECRET
      );
      res.status(user ? 200 : 201).json({ token: accessToken, user: updatedUser });
    });
  } catch (error) {
    console.error("Google Sign-In error:", error);
    res.status(500).json({ error: "Unable to process Google Sign-In." });
  }
};


module.exports = {
  authenticateToken,
  registerUser,
  loginUser,
  googleSignIn,
};
