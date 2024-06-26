import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

let BASE_URL = "http://localhost:3001/api/users";

export const userAPI = createApi({
  reducerPath: "userAPI",
  baseQuery: fetchBaseQuery({
    baseUrl: `${BASE_URL}`,
    prepareHeaders: (headers, { getState }) => {
      headers.set("Accept", "application/json");
      headers.set("Cache-Control", "no-cache");
      headers.set("Pragma", "no-cache");
      headers.set("Expires", "0");

      const token = getState().auth.token;
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
        return headers;
      }
    },
  }),
  tagTypes: ["User"],
  endpoints: (builder) => ({
    getAllUsers: builder.query({
      query: () => ({
        url: "/",
        method: "GET",
      }),
      providesTags: ["User"],
    }),
    updateUser: builder.mutation({
      query: ({ name, email, height, weight }) => ({
        url: "/",
        method: "PATCH",
        body: { name, email, height, weight },
      }),
      invalidatesTags: ["User"],
    }),
    changePassword: builder.mutation({
      query: ({ currentPassword, newPassword, confirmNewPassword }) => ({
        url: "/changePassword",
        method: "POST",
        body: { currentPassword, newPassword, confirmNewPassword },
      }),
    }),
    changeProfilePicture: builder.mutation({
      query: ({ file }) => {
        const formData = new FormData();
        formData.append("profileurl", file);

        return {
          url: "/pfp",
          method: "PATCH",
          body: formData,
        };
      },
      invalidatesTags: ["User"],
    }),
  }),
});

export const {
  useUpdateUserMutation,
  useChangePasswordMutation,
  useChangeProfilePictureMutation,
  useGetAllUsersQuery
} = userAPI;
