import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;
  // get the video from videoId\
  if (!videoId) {
    throw new ApiError(402, "Video ID not found");
  }
  const options = {
    page: page,
    limit: limit,
  };
  const comments = await Comment.aggregate([
    {
      $match: {
        video: videoId,
      },
    },
  ]);

  //TODO: get the users name, avatar
  if (!comments) {
    throw new ApiError(402, "Comments not found");
  }
  const paginatedComments = await Comment.aggregatePaginate(comments, options);
  if (!paginatedComments) {
    throw new ApiError(402, "Comments not found");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        paginatedComments,
        "Comments was fetched successfully"
      )
    );
});

const addComment = asyncHandler(async (req, res) => {
  // TODO: add a comment to a video
  const { content } = req.body;
  const { videoId } = req.params;

  if (!content && !videoId) {
    throw new ApiError(402, "Content not found");
  }

  const comment = await Comment.create({
    content,
    video: videoId,
    owner: req.user?._id,
  });

  if (!comment) {
    throw new ApiError(500, "Comment was not saved");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, comment, "Comment was added successfully"));
});

const updateComment = asyncHandler(async (req, res) => {
  // TODO: update a comment
  const { content } = req.body;
  const { commentId } = req.params;

  if (!content && !commentId) {
    throw new ApiError(402, "Content not found");
  }

  const comment = await Comment.findByIdAndUpdate(
    commentId,
    {
      $set: {
        content,
      },
    },
    { new: true }
  );

  if (!comment) {
    throw new ApiError(500, "Comment was not updated");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, comment, "Comment was updated successfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
  // TODO: delete a comment
  const { commentId } = req.params;

  if (!commentId) {
    throw new ApiError(402, "Comment not found");
  }

  const comment = await Comment.findByIdAndDelete(commentId);

  if (!comment) {
    throw new ApiError(500, "Comment was not deleted");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, comment, "Comment was deleted successfully"));
});

export { getVideoComments, addComment, updateComment, deleteComment };
