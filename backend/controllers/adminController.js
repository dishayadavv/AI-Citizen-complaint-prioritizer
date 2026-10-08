const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");


// =====================================================
// ADMIN LOGIN
// =====================================================

exports.loginAdmin = async (req, res) => {

  try {

    const { email, password } = req.body;

    // -------------------------------------------------
    // VALIDATION
    // -------------------------------------------------

    if (!email || !password) {

      return res.status(400).json({
        message: "Email and password are required."
      });

    }

    const normalizedEmail =
      email.trim().toLowerCase();


    // -------------------------------------------------
    // GET ADMIN CREDENTIALS FROM ENV
    // -------------------------------------------------

    const adminEmail =
      process.env.ADMIN_EMAIL?.trim().toLowerCase();

    const adminPassword =
      process.env.ADMIN_PASSWORD;


    if (!adminEmail || !adminPassword) {

      console.error(
        "Admin credentials are missing from .env"
      );

      return res.status(500).json({
        message: "Admin authentication is not configured."
      });

    }


    // -------------------------------------------------
    // CHECK EMAIL
    // -------------------------------------------------

    if (normalizedEmail !== adminEmail) {

      return res.status(401).json({
        message: "Invalid admin email or password."
      });

    }


    // -------------------------------------------------
    // CHECK PASSWORD
    // -------------------------------------------------

    const passwordMatches =
      password === adminPassword;


    if (!passwordMatches) {

      return res.status(401).json({
        message: "Invalid admin email or password."
      });

    }


    // -------------------------------------------------
    // CREATE JWT TOKEN
    // -------------------------------------------------

    const token =
      jwt.sign(
        {
          email: normalizedEmail,
          role: "admin"
        },

        process.env.JWT_SECRET,

        {
          expiresIn: "2h"
        }
      );


    // -------------------------------------------------
    // SUCCESS
    // -------------------------------------------------

    return res.status(200).json({

      message: "Admin login successful.",

      token,

      admin: {
        email: normalizedEmail,
        role: "admin"
      }

    });

  }

  catch (error) {

    console.error(
      "ADMIN LOGIN ERROR:",
      error
    );

    return res.status(500).json({
      message: "Error during admin login.",
      error: error.message
    });

  }

};