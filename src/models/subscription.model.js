import mongoose, { Schema } from "mongoose";

const subscriptionSchema = mongoose.Schema(
  {
    subscriber: {
      type: Schema.Types.ObjectId, //One who subscribes
      ref: "User",
    },
    channel: {
      type: Schema.Types.ObjectId, //Subscribed to
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

export const Subscription = mongoose.model("Subscription", subscriptionSchema);
