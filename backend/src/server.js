const express = require("express");
require("dotenv").config();
const cors = require("cors");
const bodyParser = require("body-parser");
const userRoute = require("./routes/userRoute.js");
const authRoute = require("./routes/authRoute.js");
const externalApiRoute = require("./routes/externalApiRoute.js");
const dailyWorkoutsRoute = require("./routes/dailyWorkoutsRoute.js");
const workoutsRoute = require("./routes/workoutsRoute.js");
const favoriteWorkoutsRoute = require("./routes/favoriteWorkoutsRoute.js");
const dailyFoodsRoute = require("./routes/dailyFoodsRoute.js");
const videosRoute = require("./routes/videoRoute.js");
const gptRoute = require("./routes/gptRoute.js");
const cloudinary = require("cloudinary").v2;

const app = express();
const port = process.env.PORT || 3000;

cloudinary.config({
  cloud_name: `${process.env.CLOUDINARY_NAME}`,
  api_key: `${process.env.CLOUDINARY_API_KEY}`,
  api_secret: `${process.env.CLOUDINARY_API_SECRET}`,
});

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/api/users", userRoute);
app.use("/api/auth", authRoute);
app.use("/api/external", externalApiRoute);
app.use("/api/dailyWorkouts", dailyWorkoutsRoute);
app.use("/api/dailyFoods", dailyFoodsRoute);
app.use("/api/favoriteWorkouts", favoriteWorkoutsRoute);
app.use("/api/workouts", workoutsRoute);
app.use("/api/videos", videosRoute);
app.use("/api/gpt", gptRoute);

app.listen(port, () => {
  console.log(`Server is running on port ${3001}`);
});
