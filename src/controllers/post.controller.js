import { Post } from "../models/post.model";
import ApiError from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";

const createPost = asyncHandler(async (req, res) => {
  //get the content and the user
  //validate the inputs
  //create the post object
  //send the response

  const { content } = req.body;
  const userId = req.user?.id;
  if (!content && !userId) {
    throw new ApiError(401, "content or user is missing");
  }
  const postObject = await Post.create({
    content,
    userId,
  });
  if (!postUser) {
    throw new ApiError(500, "Internal server error");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, postObject, "Post has been created successfully")
    );
});
const getUserPosts = asyncHandler(async (req, res) => {});

const updatePost = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const postId = req.params;
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

  if (!updatePost) {
    throw new ApiError(500, "Post was not updated");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedPost, "Post was updated successfully"));
});
const deletePost = asyncHandler(async (req, res) => {
  const postId = req.params;
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
