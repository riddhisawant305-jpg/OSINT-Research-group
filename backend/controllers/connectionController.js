const Connection = require("../models/Connection");
const User = require("../models/User");
const mongoose = require("mongoose");

// @desc    Get all connections for current user (including network members)
// @route   GET /api/connections
// @access  Private
const getConnections = async (req, res, next) => {
  try {
    const userId = req.user ? req.user._id : null;

    const connectionMap = new Map();
    if (userId) {
      // Find all accepted connections where user is requester or recipient
      const existingConnections = await Connection.find({
        $or: [{ requester: userId }, { recipient: userId }],
      });

      existingConnections.forEach((c) => {
        const otherId =
          c.requester.toString() === userId.toString()
            ? c.recipient.toString()
            : c.requester.toString();
        connectionMap.set(otherId, { status: c.status, connectionId: c._id });
      });
    }

    // Fetch other users to suggest/display in network grid
    const userQuery = userId ? { _id: { $ne: userId } } : {};
    const users = await User.find(userQuery)
      .select("name headline location avatarColor initials profilePhoto")
      .limit(30);

    const formatted = users.map((u) => {
      const connInfo = userId ? connectionMap.get(u._id.toString()) : null;
      const isConnected = connInfo && connInfo.status === "accepted";
      const isPending = connInfo && connInfo.status === "pending";

      return {
        id: u._id,
        _id: u._id,
        connectionId: connInfo ? connInfo.connectionId : null,
        user: {
          _id: u._id,
          id: u._id,
          name: u.name,
          headline: u.headline || "CareerVerse Professional",
          location: u.location || "India",
          initials: u.initials || u.name.slice(0, 2).toUpperCase(),
          avatarColor: u.avatarColor || "#7c3aed",
          profilePhoto: u.profilePhoto || "",
        },
        mutual: Math.floor(Math.random() * 30) + 5,
        connected: !!isConnected,
        pending: !!isPending,
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

// @desc    Get pending incoming connection requests
// @route   GET /api/connections/requests
// @access  Private
const getConnectionRequests = async (req, res, next) => {
  try {
    const requests = await Connection.find({
      recipient: req.user._id,
      status: "pending",
    }).populate("requester", "name headline avatarColor initials profilePhoto");

    res.status(200).json({
      success: true,
      data: requests,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Send connection request or connect
// @route   POST /api/connections/:userId
// @access  Private
const sendConnectionRequest = async (req, res, next) => {
  try {
    const targetUserId = req.params.userId;

    if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
      return res.status(400).json({ success: false, message: "Invalid target user ID" });
    }

    if (targetUserId === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: "Cannot connect to yourself" });
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Check existing connection in either direction
    let connection = await Connection.findOne({
      $or: [
        { requester: req.user._id, recipient: targetUserId },
        { requester: targetUserId, recipient: req.user._id },
      ],
    });

    if (connection) {
      if (connection.status === "accepted") {
        // Toggle/disconnect
        await connection.deleteOne();
        return res.status(200).json({
          success: true,
          connected: false,
          message: "Disconnected successfully",
        });
      }

      // If pending, accept it or cancel
      if (connection.recipient.toString() === req.user._id.toString()) {
        connection.status = "accepted";
        await connection.save();
        return res.status(200).json({
          success: true,
          connected: true,
          message: "Connection accepted",
        });
      } else {
        await connection.deleteOne();
        return res.status(200).json({
          success: true,
          connected: false,
          message: "Connection request cancelled",
        });
      }
    }

    // Otherwise create accepted connection directly for quick networking demo flow
    connection = await Connection.create({
      requester: req.user._id,
      recipient: targetUserId,
      status: "accepted",
    });

    res.status(201).json({
      success: true,
      connected: true,
      message: "Connected successfully",
      data: connection,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Accept connection request
// @route   PUT /api/connections/:id/accept
// @access  Private
const acceptConnection = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid connection ID" });
    }

    const connection = await Connection.findById(req.params.id);
    if (!connection) {
      return res.status(404).json({ success: false, message: "Connection request not found" });
    }

    if (connection.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only accept requests sent to you",
      });
    }

    connection.status = "accepted";
    await connection.save();

    res.status(200).json({
      success: true,
      message: "Connection accepted",
      data: connection,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject connection request
// @route   PUT /api/connections/:id/reject
// @access  Private
const rejectConnection = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid connection ID" });
    }

    const connection = await Connection.findById(req.params.id);
    if (!connection) {
      return res.status(404).json({ success: false, message: "Connection request not found" });
    }

    if (connection.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only reject requests sent to you",
      });
    }

    connection.status = "rejected";
    await connection.save();

    res.status(200).json({
      success: true,
      message: "Connection rejected",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete connection
// @route   DELETE /api/connections/:id
// @access  Private
const deleteConnection = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid connection ID" });
    }

    const connection = await Connection.findById(req.params.id);
    if (!connection) {
      return res.status(404).json({ success: false, message: "Connection not found" });
    }

    const uId = req.user._id.toString();
    if (
      connection.requester.toString() !== uId &&
      connection.recipient.toString() !== uId
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to remove this connection",
      });
    }

    await connection.deleteOne();

    res.status(200).json({
      success: true,
      message: "Connection removed",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getConnections,
  getConnectionRequests,
  sendConnectionRequest,
  acceptConnection,
  rejectConnection,
  deleteConnection,
};
