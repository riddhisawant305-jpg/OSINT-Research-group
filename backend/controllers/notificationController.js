const Notification = require("../models/Notification");
const mongoose = require("mongoose");

// Helper function to create notification programmatically
const createNotification = async ({ recipient, sender, type, title, text, link }) => {
  try {
    if (!recipient) return null;
    // Don't notify self
    if (sender && String(recipient) === String(sender)) return null;

    return await Notification.create({
      recipient,
      sender: sender || null,
      type: type || "system",
      title: title || "",
      text,
      link: link || "",
    });
  } catch (err) {
    console.error("Error creating notification:", err.message);
    return null;
  }
};

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .populate("sender", "name headline avatarColor profilePhoto companyName")
      .sort("-createdAt")
      .limit(50);

    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      read: false,
    });

    const formatted = notifications.map((n) => ({
      _id: n._id,
      id: n._id,
      type: n.type,
      title: n.title,
      text: n.text,
      link: n.link,
      read: n.read,
      createdAt: n.createdAt,
      user: n.sender
        ? {
            name: n.sender.name || n.sender.companyName || "CareerVerse Member",
            headline: n.sender.headline || "",
            avatarColor: n.sender.avatarColor || "#2563eb",
            profilePhoto: n.sender.profilePhoto || "",
          }
        : null,
    }));

    res.status(200).json({
      success: true,
      count: formatted.length,
      unreadCount,
      data: formatted,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid notification ID" });
    }

    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    res.status(200).json({
      success: true,
      message: "Notification marked as read",
      data: notification,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/mark-all-read
// @access  Private
const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ recipient: req.user._id, read: false }, { read: true });

    res.status(200).json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
const deleteNotification = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid notification ID" });
    }

    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      recipient: req.user._id,
    });

    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    res.status(200).json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createNotification,
};
