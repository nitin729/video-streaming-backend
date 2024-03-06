import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  const userId = req.user.id;
  const subscriptions = await Subscription.aggregate([
    {
      $match: {
        channel: channelId,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "subscriber",
        foreignField: "_id",
        as: "subscribers",
      },
    },
    {
      $addFields: {
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        isSubscribed: 1,
      },
    },
  ]);

  console.log(subscriptions);
  // TODO: toggle subscription
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  const subscriberList = await Subscription.aggregate([
    {
      $match: {
        channel: channelId,
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "subscriber",
        foreignField: req.user?._id,
        as: "subscribers",
      },
    },
    {
      $addFields: {
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        fullName: 1,
        userName: 1,
        isSubscribed: 1,
      },
    },
  ]);
  if (!subscriberList) {
    throw new ApiError(500, "Problem fetching subscibers");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, subscriberList, "Subscribers fetched successFully")
    );
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;
  console.log(subscriberId, "channelList");
  const channelList = await Subscription.aggregate([
    {
      $match: {
        subscriber: subscriberId,
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "channel",
        foreignField: req.user?._id,
        as: "channels",
      },
    },
    {
      $addFields: {
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "$channels.channel"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        fullName: 1,
        userName: 1,
        isSubscribed: 1,
      },
    },
  ]);
  console.log(channelList, "channelList");
  if (!channelList) {
    throw new ApiError(500, "Problem fetching channels");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, channelList, "Channels fetched successFully"));
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
