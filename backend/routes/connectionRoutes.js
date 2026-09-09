const express = require("express");
const router = express.Router();
const {
  getConnections,
  getConnectionRequests,
  sendConnectionRequest,
  acceptConnection,
  rejectConnection,
  deleteConnection,
} = require("../controllers/connectionController");
const { protect, optionalProtect } = require("../middleware/authMiddleware");

router.get("/", optionalProtect, getConnections);
router.get("/requests", protect, getConnectionRequests);
router.post("/:userId", protect, sendConnectionRequest);
router.put("/:id/accept", protect, acceptConnection);
router.put("/:id/reject", protect, rejectConnection);
router.delete("/:id", protect, deleteConnection);

module.exports = router;
