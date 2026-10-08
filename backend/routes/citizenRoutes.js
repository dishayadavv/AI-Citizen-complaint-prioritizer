const express = require("express");

const router = express.Router();

const citizenController =
  require("../controllers/citizenController");


router.post(
  "/register",
  citizenController.registerCitizen
);


router.post(
  "/login",
  citizenController.loginCitizen
);


router.get(
  "/:id",
  citizenController.getCitizenProfile
);


module.exports = router;