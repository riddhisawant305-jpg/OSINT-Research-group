const mongoose = require("mongoose");
const Approach = require("../models/Approach");
const User = require("../models/User");
const { createNotification } = require("./notificationController");
const {
  sendCandidateApproachedByOrgEmail,
  sendCandidateApproachedByCandidateEmail,
} = require("../services/emailService");

// @desc    Initiate an Approach or Save Candidate Details
// @route   POST /api/approaches
// @access  Private
const createApproach = async (req, res, next) => {
  try {
    const senderId = req.user._id;
    const { recipientId, action = "approach", message = "" } = req.body;

    if (!recipientId || !mongoose.Types.ObjectId.isValid(recipientId)) {
      return res.status(400).json({
        success: false,
        message: "Valid recipient candidate ID is required",
      });
    }

    if (senderId.toString() === recipientId.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot approach yourself",
      });
    }

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: "Candidate profile not found",
      });
    }

    const isOrg =
      req.user.role === "organization" || req.user.role === "recruiter";
    const senderType = isOrg ? "organization" : "candidate";

    // Rule: Candidates cannot approach organizations
    if (!isOrg && (recipient.role === "organization" || recipient.role === "recruiter")) {
      return res.status(403).json({
        success: false,
        message: "Candidate-to-organization approach is not supported. Please apply to listed openings instead.",
      });
    }

    if (action === "save_details") {
      // 1. Organization or Candidate saves contact details to contact personally
      let approach = await Approach.findOne({
        sender: senderId,
        recipient: recipientId,
      });

      if (approach) {
        approach.status = "saved_details";
        approach.notes = message || approach.notes;
        await approach.save();
      } else {
        approach = await Approach.create({
          sender: senderId,
          recipient: recipientId,
          senderType,
          recipientType: "candidate",
          status: "saved_details",
          notes: message || "Saved for personal contact.",
        });
      }

      // Add to organization's savedCandidates array if org
      if (isOrg) {
        const alreadySaved = (req.user.savedCandidates || []).some(
          (s) => s.candidate && s.candidate.toString() === recipientId.toString()
        );
        if (!alreadySaved) {
          await User.findByIdAndUpdate(senderId, {
            $push: {
              savedCandidates: {
                candidate: recipientId,
                savedAt: new Date(),
                notes: message || "Saved from profile view.",
              },
            },
          });
        }
      }

      return res.status(200).json({
        success: true,
        message: "Candidate contact details saved to your dashboard.",
        data: approach,
      });
    }

    // 2. Action === "approach": Confirmed approach, dispatch official administrator email
    let approach = await Approach.findOne({
      sender: senderId,
      recipient: recipientId,
    });

    if (approach) {
      approach.status = "approached";
      approach.message = message || approach.message;
      approach.emailSent = true;
      await approach.save();
    } else {
      approach = await Approach.create({
        sender: senderId,
        recipient: recipientId,
        senderType,
        recipientType: "candidate",
        status: "approached",
        message: message || "",
        emailSent: true,
      });
    }

    // Keep candidate in organization's saved list for convenience as well
    if (isOrg) {
      const alreadySaved = (req.user.savedCandidates || []).some(
        (s) => s.candidate && s.candidate.toString() === recipientId.toString()
      );
      if (!alreadySaved) {
        await User.findByIdAndUpdate(senderId, {
          $push: {
            savedCandidates: {
              candidate: recipientId,
              savedAt: new Date(),
              notes: message || "Approached candidate.",
            },
          },
        });
      }
    }

    // Dispatch Administrator Email based on sender type
    if (isOrg) {
      const orgCompany =
        req.user.companyName || req.user.name || "Hiring Organization";
      const orgEmail = req.user.hrDetails?.email || req.user.email;
      const orgPhone = req.user.hrDetails?.phone || req.user.phone || "";
      const orgWebsite =
        req.user.companyWebsite || req.user.organizationDetails?.website || "";
      const orgIndustry =
        req.user.companyIndustry || req.user.organizationDetails?.industry || "";
      const orgLocation = req.user.location || "";
      const orgAbout =
        req.user.about || req.user.organizationDetails?.about || "";
      const hrName = req.user.hrDetails?.name || req.user.name || "";

      sendCandidateApproachedByOrgEmail({
        to: recipient.email,
        candidateName: recipient.name,
        orgName: orgCompany,
        orgEmail,
        orgPhone,
        orgWebsite,
        orgIndustry,
        orgLocation,
        orgAbout,
        hrName,
        orgMessage: message,
        orgProfileUrl: `/profile/${senderId}`,
      }).catch((err) =>
        console.warn("[Approach] Organization email dispatch error:", err.message)
      );

      // In-app notification
      createNotification({
        recipient: recipientId,
        sender: senderId,
        type: "system",
        title: "Direct Approach from Organization",
        text: `${orgCompany} has officially approached your profile. Details sent to your email.`,
        link: `/profile/${senderId}`,
      }).catch((e) => console.warn("Notification error:", e.message));
    } else {
      // Candidate to candidate
      sendCandidateApproachedByCandidateEmail({
        to: recipient.email,
        recipientName: recipient.name,
        senderName: req.user.name,
        senderHeadline: req.user.headline,
        senderEmail: req.user.email,
        senderPhone: req.user.phone || "",
        senderLocation: req.user.location || "",
        message,
        senderProfileUrl: `/profile/${senderId}`,
      }).catch((err) =>
        console.warn("[Approach] Candidate peer email dispatch error:", err.message)
      );

      // In-app notification
      createNotification({
        recipient: recipientId,
        sender: senderId,
        type: "connection",
        title: "New Networking Approach",
        text: `${req.user.name} approached your profile for networking and collaboration.`,
        link: `/profile/${senderId}`,
      }).catch((e) => console.warn("Notification error:", e.message));
    }

    res.status(201).json({
      success: true,
      message:
        "Candidate approached successfully! An official email has been dispatched from administration.",
      data: approach,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user's sent and received approaches
// @route   GET /api/approaches/my
// @access  Private
const getMyApproaches = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const [sent, received] = await Promise.all([
      Approach.find({ sender: userId })
        .populate(
          "recipient",
          "name headline email phone location skills avatarColor profilePhoto resume resumeFileName isVerified role companyName"
        )
        .sort("-createdAt"),
      Approach.find({ recipient: userId, status: "approached" })
        .populate(
          "sender",
          "name headline email phone location skills avatarColor profilePhoto companyName companyWebsite companyIndustry hrDetails organizationDetails isVerified role"
        )
        .sort("-createdAt"),
    ]);

    res.status(200).json({
      success: true,
      data: {
        sent,
        received,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get organization's saved candidates
// @route   GET /api/approaches/saved-candidates
// @access  Private (Organization / Recruiter)
const getSavedCandidates = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Fetch from Approach records where status is 'saved_details' or 'approached'
    const approachSaved = await Approach.find({
      sender: userId,
      status: { $in: ["saved_details", "approached"] },
    })
      .populate(
        "recipient",
        "name headline email phone location skills avatarColor profilePhoto resume resumeFileName resumeFileType resumeUpdatedAt isVerified role about education experience"
      )
      .sort("-updatedAt");

    // Also fetch from user.savedCandidates array for backwards/cross compatibility
    const currentUser = await User.findById(userId).populate(
      "savedCandidates.candidate",
      "name headline email phone location skills avatarColor profilePhoto resume resumeFileName resumeFileType resumeUpdatedAt isVerified role about education experience"
    );

    const savedMap = new Map();

    approachSaved.forEach((item) => {
      if (item.recipient && item.recipient._id) {
        const cId = item.recipient._id.toString();
        savedMap.set(cId, {
          _id: item._id,
          candidate: item.recipient,
          status: item.status,
          notes: item.notes || item.message || "",
          savedAt: item.updatedAt || item.createdAt,
        });
      }
    });

    if (currentUser?.savedCandidates) {
      currentUser.savedCandidates.forEach((item) => {
        if (item.candidate && item.candidate._id) {
          const cId = item.candidate._id.toString();
          if (!savedMap.has(cId)) {
            savedMap.set(cId, {
              _id: item._id || cId,
              candidate: item.candidate,
              status: "saved_details",
              notes: item.notes || "",
              savedAt: item.savedAt || new Date(),
            });
          }
        }
      });
    }

    const savedCandidatesList = Array.from(savedMap.values());

    res.status(200).json({
      success: true,
      data: savedCandidatesList,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove candidate from saved list
// @route   DELETE /api/approaches/saved-candidates/:candidateId
// @access  Private
const removeSavedCandidate = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const candidateId = req.params.candidateId;

    await Promise.all([
      Approach.findOneAndDelete({
        sender: userId,
        recipient: candidateId,
      }),
      User.findByIdAndUpdate(userId, {
        $pull: { savedCandidates: { candidate: candidateId } },
      }),
    ]);

    res.status(200).json({
      success: true,
      message: "Candidate removed from saved list",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createApproach,
  getMyApproaches,
  getSavedCandidates,
  removeSavedCandidate,
};
