import mongoose, { Schema } from "mongoose";

const playlistSchema = new Schema(
  {
    name: {
      typed: String,
      require: true,
    },
    description: {
      type: String,
    },
    video: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

export const Playlist = mongoose.model("Playlist", playlistSchema);
