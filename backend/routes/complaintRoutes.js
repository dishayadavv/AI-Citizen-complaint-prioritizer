const express = require("express");

const router = express.Router();

const complaintController =
  require("../controllers/complaintController");

const adminAuth =
  require("../middleware/adminAuth");

const upload =
  require("../middleware/upload");


// =====================================================
// CREATE COMPLAINT
// CITIZEN / PUBLIC
// =====================================================

router.post(
  "/",
  upload.single("photo"),
  complaintController.createComplaint
);


// =====================================================
// GET ALL COMPLAINTS
// ADMIN ONLY
// =====================================================

router.get(
  "/",
  adminAuth,
  complaintController.getComplaints
);


// =====================================================
// UPDATE COMPLAINT STATUS
// ADMIN ONLY
// =====================================================

router.put(
  "/:id/status",
  adminAuth,
  complaintController.updateComplaintStatus
);


// =====================================================
// RE-ANALYZE COMPLAINTS
// ADMIN ONLY
// =====================================================

router.post(
  "/reanalyze",
  adminAuth,
  complaintController.reanalyzeComplaints
);


// =====================================================
// COMPLAINT ANALYTICS
// ADMIN ONLY
// =====================================================

router.get(
  "/analytics",
  adminAuth,
  complaintController.getComplaintAnalytics
);


// =====================================================
// CITIZEN COMPLAINTS
// =====================================================

router.get(
  "/citizen/:email",
  complaintController.getCitizenComplaints
);


// =====================================================
// TRACK SINGLE COMPLAINT
// PUBLIC
// =====================================================

router.get(
  "/:id",
  complaintController.getComplaintById
);


module.exports =
  router;