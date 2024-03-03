import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createPost,
  getUserPosts,
  updatePost,
  deletePost,
} from "../controllers/post.controller.js";

const postRouter = Router();

postRouter.use(verifyJWT);

postRouter.route("/create-post").post(createPost);
postRouter.route("/user/:id").post(getUserPosts);
postRouter.route("/update-post/:id").patch(updatePost);
postRouter.route("/delete-post").patch(deletePost);
export default postRouter;
