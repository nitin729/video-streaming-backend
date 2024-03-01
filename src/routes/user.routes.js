import { Router } from "express";
import {
  loginUser,
  logoutUser,
  registerUser,
  refreshAccessToken,
  getCurrentUser,
  changeCurrentPassword,
  updateAccountDetails,
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

userRouter.route("/logout").post(refreshAccessToken);
userRouter.route("/currentUser").post(verifyJWT, getCurrentUser);
userRouter.route("/change-password").post(verifyJWT, changeCurrentPassword);
userRouter.route("/updateAccountDetails").post(verifyJWT, updateAccountDetails);
//userRouter.route("/login").post(login);

export default userRouter;
