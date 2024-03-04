import { Router } from "express";
import {
  loginUser,
  logoutUser,
  registerUser,
  refreshAccessToken,
  getCurrentUser,
  changeCurrentPassword,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  getWatchHistory,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const userRouter = Router();

userRouter.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);
userRouter.route("/login").post(loginUser);

//secured routes

userRouter.route("/logout").post(verifyJWT, logoutUser);

userRouter.route("/refresh-access-token").post(refreshAccessToken);
userRouter.route("/current-user").post(verifyJWT, getCurrentUser);
userRouter.route("/change-password").post(verifyJWT, changeCurrentPassword);
userRouter
  .route("/update-account-details")
  .patch(verifyJWT, updateAccountDetails);
userRouter
  .route("/update-avatar")
  .patch(verifyJWT, upload.single("avatar"), updateUserAvatar);
userRouter
  .route("/update-coverImage")
  .patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage);

//params
userRouter.route("/c/:userName").get(verifyJWT, getUserChannelProfile);
userRouter.route("/history").post(verifyJWT, getWatchHistory);
//userRouter.route("/login").post(login);

export default userRouter;
