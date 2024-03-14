import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
//import { ObjectId } from "mongodb";

const getChannelStats = asyncHandler(async (req, res) => {
  // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
  console.log(new mongoose.Types.ObjectId(req.user?._id));
  const totalSubscribers = await Subscription.aggregate([
    {
      $match: {
        channel: req.user?._id,
      },
    },
    {
      $group: {
        _id: null,
        subscribers: {
          $sum: 1,
        },
      },
    },
  ]);

  const totalVideos = await Video.aggregate([
    {
      $match: {
        owner: req.user?._id,
      },
    },
    {
      $group: {
        _id: null,
        videos: {
          $sum: 1,
        },
      },
    },
  ]);

  const totalLikes = await Video.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(req.user?._id),
      },
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "video",
        as: "likes",
      },
    },
    {
      $project: {
        totalLikes: {
          $size: "$likes",
        },
        totalViews: {
          $size: "$views",
        },
      },
    },
    {
      $group: {
        _id: null,
        totalLikes: { $sum: "$totalLikes" },
        totalViews: { $sum: "$totalViews" },
      },
    },
  ]);

  const stats = {
    subs: totalSubscribers,
    vids: totalVideos,
    likes: totalLikes,
  };

  /*   const subscribers = await Subscription.aggregate([
    {
      $match: {
        channel: req.user?._id,
      },
    },
    {
      $group: {
        _id: null,
        totalSubscribers: {
          $sum: 1,
        },
      },
    },
  ]); */

  console.log(stats);
  if (!stats) {
    throw new ApiError(500, "Stats not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, stats, "Stats fetched successfully"));
});

const getChannelVideos = asyncHandler(async (req, res) => {
  // TODO: Get all the videos uploaded by the channel
  const videos = await Video.find({ owner: req.user?._id });
  if (!videos) {
    throw new ApiError(500, "Videos not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, videos, "Videos fetched successfully"));
});

export { getChannelStats, getChannelVideos };
