const express = require("express");

const router = express.Router();

const adminController =
  require("../controllers/adminController");


// =====================================================
// ADMIN LOGIN
// =====================================================

router.post(
  "/login",
  adminController.loginAdmin
);


module.exports = router;