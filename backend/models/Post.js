const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      default: "",
      trim: true,
    },
    privacy: {
      type: String,
      enum: ["Anyone", "Connections", "Only Me"],
      default: "Anyone",
    },
    media: {
      type: String,
      default: "",
    },
    mediaType: {
      type: String,
      enum: ["image", "video", "document", "none"],
      default: "none",
    },
    mediaName: {
      type: String,
      default: "",
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    comments: [commentSchema],
    shares: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for likes count
postSchema.virtual("likesCount").get(function () {
  return this.likes ? this.likes.length : 0;
});

// Virtual for comments count
postSchema.virtual("commentsCount").get(function () {
  return this.comments ? this.comments.length : 0;
});

module.exports = mongoose.model("Post", postSchema);
