import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: toggle like on video

  const existingLikedVideo = await Like.findOne(
    { video: videoId },
    { likedBy: req.user?._id }
  );
  if (existingLikedVideo) {
    await Like.findByIdAndDelete(existingLikedVideo?._id);
    return res.status(200).json(200, { isLiked: false }, "Removed like");
  }
  const likedVideo = await Like.create({
    video: videoId,
    likedBy: req.user?._id,
  });
  if (!likedVideo) {
    throw new ApiError(500, " error liking video");
  }

  return res.status(200).json(200, { isLiked: true }, "Liked the video");
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  //TODO: toggle like on comment
  const existingLikedComment = await Like.findOne(
    { comment: commentId },
    { likedBy: req.user?._id }
  );
  if (existingLikedComment) {
    await Like.findByIdAndDelete(existingLikedComment?._id);
    return res.status(200).json(200, { isLiked: false }, "Removed like");
  }
  const likedComment = await Like.create({
    comment: commentId,
    likedBy: req.user?._id,
  });
  if (!likedComment) {
    throw new ApiError(500, " error liking Comment");
  }

  return res.status(200).json(200, { isLiked: true }, "Liked the Comment");
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  //TODO: toggle like on tweet
  const existingLikedPost = await Like.findOne(
    { post: postId },
    { likedBy: req.user?._id }
  );
  if (existingLikedPost) {
    await Like.findByIdAndDelete(existingLikedPost?._id);
    return res.status(200).json(200, { isLiked: false }, "Removed like");
  }
  const likedPost = await Like.create({
    post: postId,
    likedBy: req.user?._id,
  });
  if (!likedPost) {
    throw new ApiError(500, " error liking Post");
  }

  return res.status(200).json(200, { isLiked: true }, "Liked the Post");
});

const getLikedVideos = asyncHandler(async (req, res) => {
  //TODO: get all videos liked by the users
  const videos = await Like.aggregate([
    //get all the like documents of the used
    {
      $match: {
        likedBy: req.user?._id,
      },
    },
    //Group the documents according to the videos
    {
      $group: {
        _id: "$video",
        $count: {
          $sum: 1,
        },
      },
    },
    //Look up the videos collection for the videodetails
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "videoDetails",
      },
    },
    //return the video details
    {
      $project: {
        videoDetails: { $arrayElemAt: ["$videoDetails", 0] },
        likeCount: "$count",
      },
    },
  ]);

  if (!videos) {
    throw new ApiError(500, "Error fetching the liked videos");
  }

  return res.status(200).json(200, videos, "Liked videos fetched successfully");
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
