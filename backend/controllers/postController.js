const Post = require("../models/Post");
const User = require("../models/User");
const Connection = require("../models/Connection");
const mongoose = require("mongoose");
const { createNotification } = require("./notificationController");
const {
  sendPostInteractionEmail,
  sendConnectionPostEmail,
} = require("../services/emailService");

// @desc    Get all posts (feed)
// @route   GET /api/posts
// @access  Public / Private
const getPosts = async (req, res, next) => {
  try {
    const posts = await Post.find()
      .populate("author", "name headline avatarColor profilePhoto isVerified")
      .populate("comments.user", "name headline avatarColor profilePhoto isVerified")
      .sort({ createdAt: -1 });

    // Format posts to match frontend PostCard expectations
    const formatted = posts.map((p) => {
      const author = p.author || {
        name: "CareerVerse Member",
        headline: "Professional",
        avatarColor: "#2563eb",
        isVerified: false,
      };

      const diff = Date.now() - new Date(p.createdAt).getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const days = Math.floor(hours / 24);
      const timeStr = days > 0 ? `${days}d` : hours > 0 ? `${hours}h` : "just now";

      return {
        _id: p._id,
        id: p._id,
        user: {
          id: author._id,
          _id: author._id,
          name: author.name,
          headline: author.headline,
          avatarColor: author.avatarColor || "#2563eb",
          profilePhoto: author.profilePhoto || "",
          isVerified: !!author.isVerified,
        },
        time: timeStr,
        content: p.content || "",
        media: p.media || "",
        mediaType: p.mediaType || (p.media ? "image" : "none"),
        mediaName: p.mediaName || "",
        likes: p.likes ? p.likes.length : 0,
        liked: req.user ? p.likes.some((id) => id.toString() === req.user._id.toString()) : false,
        comments: p.comments ? p.comments.length : 0,
        commentsList: (p.comments || []).map((c) => ({
          _id: c._id,
          text: c.text,
          createdAt: c.createdAt,
          user: c.user
            ? {
                name: c.user.name,
                headline: c.user.headline,
                avatarColor: c.user.avatarColor || "#2563eb",
                profilePhoto: c.user.profilePhoto || "",
                isVerified: !!c.user.isVerified,
              }
            : null,
        })),
        shares: p.shares || 0,
        createdAt: p.createdAt,
      };
    });

    res.status(200).json({
      success: true,
      data: formatted,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single post by ID
// @route   GET /api/posts/:id
// @access  Public
const getPostById = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid post ID" });
    }

    const post = await Post.findById(req.params.id)
      .populate("author", "name headline avatarColor profilePhoto isVerified")
      .populate("comments.user", "name headline avatarColor profilePhoto isVerified");

    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    res.status(200).json({ success: true, data: post });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private
const createPost = async (req, res, next) => {
  try {
    const { content, privacy } = req.body;
    let media = req.body.media || "";
    let mediaType = req.body.mediaType || "none";
    let mediaName = req.body.mediaName || "";

    if (req.file) {
      media = `/uploads/posts/${req.file.filename}`;
      mediaName = req.file.originalname;
      const mime = req.file.mimetype || "";
      if (mime.startsWith("image/")) {
        mediaType = "image";
      } else if (mime.startsWith("video/")) {
        mediaType = "video";
      } else {
        mediaType = "document";
      }
    }

    const trimmedContent = (content || "").trim();

    if (!trimmedContent && !media) {
      return res.status(400).json({
        success: false,
        message: "Please provide post text or attach an image, video, or document",
      });
    }

    const post = await Post.create({
      author: req.user._id,
      content: trimmedContent,
      privacy: privacy || "Anyone",
      media,
      mediaType,
      mediaName,
    });

    await post.populate("author", "name headline avatarColor profilePhoto isVerified");

    // Asynchronously notify author's connections via email
    try {
      const connections = await Connection.find({
        $or: [{ requester: req.user._id }, { recipient: req.user._id }],
        status: "accepted",
      });

      const connectionUserIds = connections.map((c) =>
        c.requester.toString() === req.user._id.toString() ? c.recipient : c.requester
      );

      if (connectionUserIds.length > 0) {
        const connectedUsers = await User.find({
          _id: { $in: connectionUserIds },
        }).select("name email");

        const postSnippet = trimmedContent.length > 120 ? trimmedContent.slice(0, 120) + "..." : trimmedContent;

        connectedUsers.forEach((u) => {
          sendConnectionPostEmail({
            to: u.email,
            recipientName: u.name,
            actorName: req.user.name,
            postSnippet,
          }).catch((err) => console.warn("[Post] Failed to send connection post email:", err.message));
        });
      }
    } catch (connErr) {
      console.warn("[Post] Connection notification error:", connErr.message);
    }

    res.status(201).json({
      success: true,
      message: "Post created successfully",
      data: post,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update own post
// @route   PUT /api/posts/:id
// @access  Private
const updatePost = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid post ID" });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only edit your own posts",
      });
    }

    const { content, privacy } = req.body;
    if (content !== undefined) post.content = content.trim();
    if (privacy !== undefined) post.privacy = privacy;

    await post.save();

    res.status(200).json({
      success: true,
      message: "Post updated successfully",
      data: post,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete own post
// @route   DELETE /api/posts/:id
// @access  Private
const deletePost = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid post ID" });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    if (post.author.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own posts",
      });
    }

    await post.deleteOne();

    res.status(200).json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle like on a post
// @route   POST /api/posts/:id/like
// @access  Private
const toggleLike = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid post ID" });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    const userIdStr = req.user._id.toString();
    const isLiked = post.likes.some((id) => id.toString() === userIdStr);

    if (isLiked) {
      post.likes = post.likes.filter((id) => id.toString() !== userIdStr);
    } else {
      post.likes.push(req.user._id);

      if (post.author.toString() !== req.user._id.toString()) {
        await createNotification({
          recipient: post.author,
          sender: req.user._id,
          type: "like",
          title: "Post Liked",
          text: `${req.user.name} liked your post.`,
          link: `/profile/${post.author}`,
        });

        // Asynchronously notify post author via email
        User.findById(post.author).select("name email").then((authorUser) => {
          if (authorUser && authorUser.email) {
            sendPostInteractionEmail({
              to: authorUser.email,
              recipientName: authorUser.name,
              actorName: req.user.name,
              type: "like",
              postSnippet: post.content ? (post.content.slice(0, 100) + (post.content.length > 100 ? "..." : "")) : "",
            }).catch((err) => console.warn("[Post] Like email dispatch error:", err.message));
          }
        }).catch((err) => console.warn("[Post] Author lookup error for like email:", err.message));
      }
    }

    await post.save();

    res.status(200).json({
      success: true,
      liked: !isLiked,
      likesCount: post.likes.length,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add comment to a post
// @route   POST /api/posts/:id/comments
// @access  Private
const addComment = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid post ID" });
    }

    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: "Comment text is required" });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    const comment = {
      user: req.user._id,
      text: text.trim(),
      createdAt: new Date(),
    };

    post.comments.push(comment);
    await post.save();
    await post.populate("comments.user", "name headline avatarColor profilePhoto");

    if (post.author.toString() !== req.user._id.toString()) {
      await createNotification({
        recipient: post.author,
        sender: req.user._id,
        type: "comment",
        title: "New Comment",
        text: `${req.user.name} commented: "${text.trim().slice(0, 40)}"`,
        link: `/profile/${post.author}`,
      });

      // Asynchronously notify post author via email
      User.findById(post.author).select("name email").then((authorUser) => {
        if (authorUser && authorUser.email) {
          sendPostInteractionEmail({
            to: authorUser.email,
            recipientName: authorUser.name,
            actorName: req.user.name,
            type: "comment",
            postSnippet: post.content ? (post.content.slice(0, 100) + (post.content.length > 100 ? "..." : "")) : "",
            commentText: text.trim(),
          }).catch((err) => console.warn("[Post] Comment email dispatch error:", err.message));
        }
      }).catch((err) => console.warn("[Post] Author lookup error for comment email:", err.message));
    }

    res.status(201).json({
      success: true,
      message: "Comment added",
      data: post.comments[post.comments.length - 1],
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Share a post (increment share count)
// @route   POST /api/posts/:id/share
// @access  Public / Private
const sharePost = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid post ID" });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    post.shares = (post.shares || 0) + 1;
    await post.save();

    res.status(200).json({
      success: true,
      message: "Post shared successfully",
      sharesCount: post.shares,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  toggleLike,
  addComment,
  sharePost,
};
