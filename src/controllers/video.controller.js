import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";

import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  //TODO: get all videos based on query, sort, pagination
  const options = {
    page: page,
    limit: limit,
  };
  const videos = await Video.aggregate([
    /*   {
      $match: { owner: userId },
    }, */
    {
      $lookup: {
        from: "videos",
        localField: "owner",
        foreignField: "_id",
        as: "filteredVideos",
      },
    },
    {
      $project: {
        videoUrl: 1,
        title: 1,
        owner: 1,
      },
    },
    {
      $project: {
        videoUrl: 1,
        title: 1,
        owner: 1,
      },
    },
  ]);
  if (!videos) {
    throw new ApiError(500, "Could not fetch videos");
  }

  const paginatedVids = await Video.aggregatePaginate(videos, options);
  if (!videos) {
    throw new ApiError(500, "Could not fetch videos");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, paginatedVids, "Video fetched successfully"));
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description, isPublished } = req.body;
  const userId = req.user?._id;
  // TODO: get video, upload to cloudinary, create video
  if (!title && !description) {
    throw new ApiError(400, "title or description missing");
  }

  const thumbnailLocalPath = req.files?.thumbnail[0]?.path;
  const videoLocalPath = req.files?.videoFile[0]?.path;
  if (!videoLocalPath) {
    throw new ApiError(400, "Video is missing");
  }
  if (!thumbnailLocalPath) {
    throw new ApiError(400, "thumbnail is missing");
  }

  const thumbnailUrl = await uploadOnCloudinary(thumbnailLocalPath);
  const videoUrl = await uploadOnCloudinary(videoLocalPath);
  const duration = await videoUrl.duration;
  const videoDoc = await Video.create({
    videoFile: videoUrl?.url,
    thumbnail: thumbnailUrl?.url,
    title: title,
    description: description,
    duration: duration,
    views: 0,
    isPublished: isPublished,
    owner: userId,
  });
  if (!videoDoc) {
    throw new ApiError(500, "Video document was not created");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, videoDoc, "Video was uploaded successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  //TODO: get video by id
  const { videoId } = req.params;
  if (!videoId) {
    throw new ApiError(400, "Video not found");
  }
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(500, "Video not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, video, "video fetched successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, description, thumbnail } = req.body;
  //TODO: update video details like title, description, thumbnail
  if (!videoId) {
    throw new ApiError(400, "Video not found");
  }
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(500, "Video not found");
  }
  const thumbnailLocalPath = req.files?.thumbnail?.path;
  if (!thumbnailLocalPath) {
    throw new ApiError(400, "thumbnail is missing");
  }

  const thumbnailUrl = await uploadOnCloudinary(thumbnailLocalPath);
  video.title = title;
  video.description = description;
  video.thumbnail = thumbnailUrl.url;

  const updatedVideo = await video.save({ new: true });
  if (!updatedVideo) {
    throw new ApiError(500, "Video was not updated");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, updatedVideo, "video fupdated successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) {
    throw new ApiError(400, "Video not found");
  }
  const video = await Video.findByIdAndDelete(videoId);
  if (!video) {
    throw new ApiError(500, "Video not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "video deleted successfully"));
  //TODO: delete video
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { isPublished } = req.body;
  if (!videoId) {
    throw new ApiError(400, "Video not found");
  }
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(500, "Video not found");
  }
  video.isPublished = isPublished;
  const updatedVideo = await video.save({ new: true });
  if (!updatedVideo) {
    throw new ApiError(500, "Video was not updated");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedVideo.isPublished,
        "video updated successfully"
      )
    );
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
