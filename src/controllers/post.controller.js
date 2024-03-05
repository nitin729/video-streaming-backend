import { mongo } from "mongoose";
import { Post } from "../models/post.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPost = asyncHandler(async (req, res) => {
  //get the content and the user
  //validate the inputs
  //create the post object
  //send the response

  const { content } = req.body;
  const userId = req.user?._id;
  if (!content && !userId) {
    throw new ApiError(401, "content or user is missing");
  }

  const postObject = await Post.create({
    content,
    owner: userId,
  });
  if (!postObject) {
    throw new ApiError(500, "Internal server error");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, postObject, "Post has been created successfully")
    );
});
const getUserPosts = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  if (!userId) {
    throw new ApiError(401, "User not found");
  }
  const userPosts = await Post.find({ owner: userId });

  if (!userPosts) {
    throw new ApiError(500, "Posts not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, userPosts, "Posts fetched successfully"));
});

const updatePost = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const postId = req.params.id;
  console.log(content);
  if (!content && !postId) {
    throw new ApiError(401, "Content cannot be empty");
  }

  const updatedPost = await Post.findByIdAndUpdate(
    postId,
    {
      $set: {
        content,
      },
    },
    { new: true }
  );
  console.log(updatedPost);
  if (!updatedPost) {
    throw new ApiError(500, "Post was not updated");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedPost, "Post was updated successfully"));
});
const deletePost = asyncHandler(async (req, res) => {
  const postId = req.body.id;
  if (!postId) {
    throw new ApiError(401, "Post not found");
  }
  const result = await Post.findByIdAndDelete(postId);
  console.log(result, "delete result");
  if (!result) {
    throw new ApiError(500, "Pos was not deleted");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Post was deleted successfully"));
});

export { createPost, getUserPosts, updatePost, deletePost };
