const express = require("express");
const router = express.Router();
const {
  createApproach,
  getMyApproaches,
  getSavedCandidates,
  removeSavedCandidate,
} = require("../controllers/approachController");
const { protect } = require("../middleware/authMiddleware");

// All approach endpoints are private
router.use(protect);

router.post("/", createApproach);
router.get("/my", getMyApproaches);
router.get("/saved-candidates", getSavedCandidates);
router.delete("/saved-candidates/:candidateId", removeSavedCandidate);

module.exports = router;
