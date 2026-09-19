const Message = require("../models/Message");
const User = require("../models/User");
const Notification = require("../models/Notification");

// @desc    Get all active conversations for the logged-in user
// @route   GET /api/messages/conversations
// @access  Private
const getConversations = async (req, res, next) => {
  try {
    const currentUserId = req.user._id;

    // Find all messages involving current user
    const messages = await Message.find({
      $or: [{ sender: currentUserId }, { recipient: currentUserId }],
    })
      .sort("-createdAt")
      .populate("sender", "name headline avatarColor profilePhoto isVerified messagingEnabled role")
      .populate("recipient", "name headline avatarColor profilePhoto isVerified messagingEnabled role");

    // Group by unique conversation partner
    const conversationsMap = new Map();

    for (const msg of messages) {
      if (!msg.sender || !msg.recipient) continue;

      const isMeSender = msg.sender._id.toString() === currentUserId.toString();
      const partner = isMeSender ? msg.recipient : msg.sender;
      const partnerId = partner._id.toString();

      if (!conversationsMap.has(partnerId)) {
        conversationsMap.set(partnerId, {
          id: partnerId,
          user: {
            _id: partner._id,
            name: partner.name,
            headline: partner.headline,
            avatarColor: partner.avatarColor,
            profilePhoto: partner.profilePhoto,
            isVerified: partner.isVerified,
            messagingEnabled: partner.messagingEnabled !== false,
            role: partner.role,
          },
          lastMessage: {
            _id: msg._id,
            text: msg.text,
            createdAt: msg.createdAt,
            fromMe: isMeSender,
            read: msg.read,
          },
          unreadCount: 0,
        });
      }

      // Increment unread count if message was sent to me and is unread
      if (!isMeSender && !msg.read) {
        const conv = conversationsMap.get(partnerId);
        conv.unreadCount += 1;
      }
    }

    const conversations = Array.from(conversationsMap.values());

    res.status(200).json({
      success: true,
      data: conversations,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get message thread with a specific candidate
// @route   GET /api/messages/:userId
// @access  Private
const getMessagesWithUser = async (req, res, next) => {
  try {
    const currentUserId = req.user._id;
    const { userId } = req.params;

    if (userId.toString() === currentUserId.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot message yourself",
      });
    }

    const partner = await User.findById(userId).select(
      "name headline avatarColor profilePhoto isVerified messagingEnabled role location email phone"
    );

    if (!partner) {
      return res.status(404).json({
        success: false,
        message: "Conversation user not found",
      });
    }

    // Fetch chronological message thread
    const messages = await Message.find({
      $or: [
        { sender: currentUserId, recipient: userId },
        { sender: userId, recipient: currentUserId },
      ],
    }).sort("createdAt");

    // Mark incoming unread messages as read
    await Message.updateMany(
      {
        sender: userId,
        recipient: currentUserId,
        read: false,
      },
      {
        $set: { read: true, readAt: new Date() },
      }
    );

    res.status(200).json({
      success: true,
      partner: {
        _id: partner._id,
        name: partner.name,
        headline: partner.headline,
        avatarColor: partner.avatarColor,
        profilePhoto: partner.profilePhoto,
        isVerified: partner.isVerified,
        messagingEnabled: partner.messagingEnabled !== false,
        role: partner.role,
        location: partner.location,
      },
      data: messages,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Send a message to a candidate
// @route   POST /api/messages/:userId
// @access  Private
const sendMessage = async (req, res, next) => {
  try {
    const currentUserId = req.user._id;
    const { userId } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message content cannot be empty",
      });
    }

    if (userId.toString() === currentUserId.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot message yourself",
      });
    }

    // Sender check: must have messagingEnabled === true
    const sender = await User.findById(currentUserId);
    if (sender.messagingEnabled === false) {
      return res.status(403).json({
        success: false,
        message:
          "You have disabled direct messaging in your dashboard settings. Please enable messaging in your dashboard to chat with other candidates.",
      });
    }

    // Recipient check
    const recipient = await User.findById(userId);
    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: "Recipient user not found",
      });
    }

    // Check if recipient is organization/recruiter
    if (
      recipient.role === "organization" ||
      recipient.role === "recruiter" ||
      sender.role === "organization" ||
      sender.role === "recruiter"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Direct messaging is designated for candidate-to-candidate networking. Organizations should use the official Approach feature.",
      });
    }

    // Recipient messaging restriction check
    if (recipient.messagingEnabled === false) {
      return res.status(403).json({
        success: false,
        message: `${recipient.name} has disabled direct messaging in their dashboard settings.`,
      });
    }

    // Create the message
    const message = await Message.create({
      sender: currentUserId,
      recipient: recipient._id,
      text: text.trim(),
    });

    // Create an in-app notification for the recipient
    try {
      const preview =
        text.trim().length > 60 ? text.trim().slice(0, 60) + "..." : text.trim();
      await Notification.create({
        recipient: recipient._id,
        sender: sender._id,
        type: "message",
        title: "New Message",
        text: `${sender.name}: ${preview}`,
        link: `/messages?userId=${sender._id}`,
      });
    } catch (notifErr) {
      console.warn("Could not create message notification:", notifErr.message);
    }

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: message,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark all messages in a conversation as read
// @route   PUT /api/messages/read/:userId
// @access  Private
const markConversationAsRead = async (req, res, next) => {
  try {
    const currentUserId = req.user._id;
    const { userId } = req.params;

    await Message.updateMany(
      {
        sender: userId,
        recipient: currentUserId,
        read: false,
      },
      {
        $set: { read: true, readAt: new Date() },
      }
    );

    res.status(200).json({
      success: true,
      message: "Messages marked as read",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getConversations,
  getMessagesWithUser,
  sendMessage,
  markConversationAsRead,
};
