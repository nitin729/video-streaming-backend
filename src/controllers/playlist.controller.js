import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ObjectId } from "mongodb";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  //TODO: create playlist

  if (!name && !description) {
    throw new ApiError(401, "name or description not found");
  }
  const playlist = await Playlist.create({
    name,
    description,
    owner: req.user?._id,
    videos: [],
  });

  if (!playlist) {
    throw new ApiError(500, "Playlist not created");
  }

  return res
    .status(200)
    .json(200, playlist, "Playlist was created successfully");
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  //TODO: get user playlists
  if (!userId) {
    throw new ApiError(401, "userId not found");
  }
  const playlists = await Playlist.aggregate([
    {
      $match: {
        owner: new ObjectId(userId),
      },
    },
  ]);

  if (!playlists) {
    throw new ApiError(500, "playlists not found");
  }
  return res
    .status(200)
    .json(200, playlists, "Playlists was fetched successfully");
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  //TODO: get playlist by id

  if (!playlistId) {
    throw new ApiError(401, "playlistId not found");
  }

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new ApiError(500, "playlist not found");
  }

  return res
    .status(200)
    .json(200, playlist, "Playlist was fetched successfully");
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if (!playlistId && !videoId) {
    throw new ApiError(400, "playlistId or videoId are missing");
  }

  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $addToSet: {
        videos: videoId,
      },
    },
    {
      new: true,
    }
  );

  if (!updatedPlaylist) {
    throw new ApiError(500, "Problem adding videos to the playlist");
  }
  return res
    .status(200)
    .json(200, updatedPlaylist, "Video was added to the playlist successfully");
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  // TODO: remove video from playlist

  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $pull: {
        videos: videoId,
      },
    },
    {
      new: true,
    }
  );

  if (!updatedPlaylist) {
    throw new ApiError(500, "Problem removing videos from the playlist");
  }
  return res
    .status(200)
    .json(
      200,
      updatedPlaylist,
      "Video was removed to the playlist successfully"
    );
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  // TODO: delete playlist
  if (!playlistId) {
    throw new ApiError(400, "playlistId are missing");
  }

  const updatedPlaylist = await Playlist.findByIdAndDelete(playlistId);

  if (!updatedPlaylist) {
    throw new ApiError(500, "Problem deleting playlist");
  }
  return res.status(200).json(200, {}, "Playlist was deleted successfully");
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  //TODO: update playlist
  if (!playlistId) {
    throw new ApiError(400, "playlistId are missing");
  }
  if (!name && !description) {
    throw new ApiError(400, "name or description are missing");
  }

  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $set: {
        name,
        description,
      },
    },
    {
      new: true,
    }
  );

  if (!updatedPlaylist) {
    throw new ApiError(500, "Problem updating the playlist");
  }
  return res
    .status(200)
    .json(200, updatedPlaylist, "Playlist was updated successfully");
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
