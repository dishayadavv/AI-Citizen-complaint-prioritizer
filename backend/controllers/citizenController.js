const Citizen = require("../models/Citizen");
const Complaint = require("../models/Complaint");
const bcrypt = require("bcryptjs");


// =====================================================
// EMAIL VALIDATION
// =====================================================

const emailPattern =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


// =====================================================
// REGISTER CITIZEN
// =====================================================

exports.registerCitizen = async (req, res) => {

  try {

    console.log("=================================");
    console.log("CITIZEN REGISTER REQUEST");
    console.log("=================================");


    const {
      name,
      email,
      phone,
      password,
      address,
      city
    } = req.body;


    // ===================================================
    // BASIC VALIDATION
    // ===================================================

    if (
      !name ||
      !email ||
      !password
    ) {

      return res.status(400).json({

        message:
          "Name, email and password are required."

      });

    }


    // ===================================================
    // CLEAN DATA
    // ===================================================

    const cleanName =
      name.trim();

    const cleanEmail =
      email.toLowerCase().trim();

    const cleanPhone =
      phone
        ? phone.trim()
        : "";

    const cleanAddress =
      address
        ? address.trim()
        : "";

    const cleanCity =
      city
        ? city.trim()
        : "";


    // ===================================================
    // NAME VALIDATION
    // ===================================================

    if (cleanName.length < 2) {

      return res.status(400).json({

        message:
          "Please enter a valid name."

      });

    }


    // ===================================================
    // EMAIL VALIDATION
    // ===================================================

    if (
      !emailPattern.test(cleanEmail)
    ) {

      return res.status(400).json({

        message:
          "Please enter a valid email address."

      });

    }


    // ===================================================
    // PASSWORD VALIDATION
    // ===================================================

    if (
      password.length < 6
    ) {

      return res.status(400).json({

        message:
          "Password must contain at least 6 characters."

      });

    }


    // ===================================================
    // CHECK EXISTING CITIZEN
    // ===================================================

    console.log(
      "Checking whether email already exists..."
    );


    const existingCitizen =
      await Citizen.findOne({

        email:
          cleanEmail

      });


    if (existingCitizen) {

      console.log(
        "Duplicate email found."
      );


      return res.status(409).json({

        message:
          "An account with this email already exists."

      });

    }


    // ===================================================
    // HASH PASSWORD
    // ===================================================

    console.log(
      "Hashing password securely..."
    );


    const hashedPassword =
      await bcrypt.hash(
        password,
        12
      );


    // ===================================================
    // CREATE CITIZEN
    // ===================================================

    const citizen =
      new Citizen({

        name:
          cleanName,

        email:
          cleanEmail,

        phone:
          cleanPhone,

        password:
          hashedPassword,

        address:
          cleanAddress,

        city:
          cleanCity

      });


    // ===================================================
    // SAVE TO MONGODB
    // ===================================================

    await citizen.save();


    console.log(
      "CITIZEN SAVED SUCCESSFULLY!"
    );


    // ===================================================
    // SAFE RESPONSE
    // ===================================================
    // IMPORTANT:
    // Password is NEVER returned to Angular.
    // ===================================================

    return res.status(201).json({

      message:
        "Citizen account created successfully.",

      citizen: {

        id:
          citizen._id,

        name:
          citizen.name,

        email:
          citizen.email,

        phone:
          citizen.phone,

        address:
          citizen.address,

        city:
          citizen.city

      }

    });

  }

  catch (error) {

    console.error(
      "CITIZEN REGISTER ERROR:",
      error
    );


    // ===================================================
    // MONGOOSE DUPLICATE KEY
    // ===================================================

    if (error.code === 11000) {

      return res.status(409).json({

        message:
          "An account with this email already exists."

      });

    }


    return res.status(500).json({

      message:
        "Error creating citizen account."

    });

  }

};


// =====================================================
// LOGIN CITIZEN
// =====================================================

exports.loginCitizen = async (req, res) => {

  try {

    const {
      email,
      password
    } = req.body;


    // ===================================================
    // BASIC VALIDATION
    // ===================================================

    if (
      !email ||
      !password
    ) {

      return res.status(400).json({

        message:
          "Email and password are required."

      });

    }


    // ===================================================
    // CLEAN EMAIL
    // ===================================================

    const cleanEmail =
      email.toLowerCase().trim();


    // ===================================================
    // EMAIL VALIDATION
    // ===================================================

    if (
      !emailPattern.test(cleanEmail)
    ) {

      return res.status(400).json({

        message:
          "Please enter a valid email address."

      });

    }


    // ===================================================
    // FIND CITIZEN
    // ===================================================

    const citizen =
      await Citizen.findOne({

        email:
          cleanEmail

      });


    // ===================================================
    // CITIZEN NOT FOUND
    // ===================================================

    if (!citizen) {

      return res.status(401).json({

        message:
          "Invalid email or password."

      });

    }


    // ===================================================
    // CHECK ACCOUNT STATUS
    // ===================================================

    if (
      citizen.isActive === false
    ) {

      return res.status(403).json({

        message:
          "This account has been disabled."

      });

    }


    // ===================================================
    // SECURE PASSWORD CHECK
    // ===================================================

    let passwordMatches = false;


    // ---------------------------------------------------
    // CHECK WHETHER PASSWORD IS ALREADY BCRYPT HASHED
    // ---------------------------------------------------

    const isBcryptHash =
      typeof citizen.password === "string" &&
      (
        citizen.password.startsWith("$2a$") ||
        citizen.password.startsWith("$2b$") ||
        citizen.password.startsWith("$2y$")
      );


    if (isBcryptHash) {

      // -------------------------------------------------
      // SECURE BCRYPT COMPARISON
      // -------------------------------------------------

      passwordMatches =
        await bcrypt.compare(
          password,
          citizen.password
        );

    }

    else {

      // -------------------------------------------------
      // OLD PLAIN-TEXT PASSWORD SUPPORT
      // -------------------------------------------------
      // This allows existing accounts created before
      // bcrypt was added to continue working.
      //
      // After successful login, the old password is
      // immediately converted to a secure bcrypt hash.
      // -------------------------------------------------

      passwordMatches =
        citizen.password === password;


      if (passwordMatches) {

        console.log(
          "Old password detected. Upgrading to bcrypt..."
        );


        citizen.password =
          await bcrypt.hash(
            password,
            12
          );


        await citizen.save();


        console.log(
          "Password successfully upgraded to bcrypt."
        );

      }

    }


    // ===================================================
    // PASSWORD INCORRECT
    // ===================================================

    if (!passwordMatches) {

      return res.status(401).json({

        message:
          "Invalid email or password."

      });

    }


    // ===================================================
    // SAFE LOGIN RESPONSE
    // ===================================================
    // NEVER send password to frontend.
    // ===================================================

    return res.status(200).json({

      message:
        "Login successful.",

      citizen: {

        id:
          citizen._id,

        name:
          citizen.name,

        email:
          citizen.email,

        phone:
          citizen.phone,

        address:
          citizen.address,

        city:
          citizen.city

      }

    });

  }

  catch (error) {

    console.error(
      "CITIZEN LOGIN ERROR:",
      error
    );


    return res.status(500).json({

      message:
        "Error logging in."

    });

  }

};


// =====================================================
// GET CITIZEN PROFILE
// =====================================================

exports.getCitizenProfile =
  async (req, res) => {

    try {

      const citizen =
        await Citizen.findById(
          req.params.id
        );


      // =================================================
      // CITIZEN NOT FOUND
      // =================================================

      if (!citizen) {

        return res.status(404).json({

          message:
            "Citizen not found."

        });

      }


      // =================================================
      // SAFE PROFILE RESPONSE
      // =================================================

      return res.status(200).json({

        id:
          citizen._id,

        name:
          citizen.name,

        email:
          citizen.email,

        phone:
          citizen.phone,

        address:
          citizen.address,

        city:
          citizen.city,

        isActive:
          citizen.isActive

      });

    }

    catch (error) {

      console.error(
        "GET CITIZEN PROFILE ERROR:",
        error
      );


      return res.status(500).json({

        message:
          "Error fetching citizen profile."

      });

    }

  };


// =====================================================
// GET COMPLAINTS FOR A SPECIFIC CITIZEN
// =====================================================

exports.getCitizenComplaints =
  async (req, res) => {

    try {

      const email =
        req.params.email;


      // =================================================
      // VALIDATE EMAIL
      // =================================================

      if (!email) {

        return res.status(400).json({

          message:
            "Citizen email is required."

        });

      }


      const cleanEmail =
        email.toLowerCase().trim();


      // =================================================
      // VALIDATE EMAIL FORMAT
      // =================================================

      if (
        !emailPattern.test(cleanEmail)
      ) {

        return res.status(400).json({

          message:
            "Please provide a valid citizen email."

        });

      }


      console.log(
        "GET CITIZEN COMPLAINTS:",
        cleanEmail
      );


      // =================================================
      // FIND COMPLAINTS
      // =================================================

      const complaints =
        await Complaint.find({

          "citizen.email":
            cleanEmail

        })
        .sort({

          createdAt:
            -1

        });


      console.log(
        `Found ${complaints.length} complaints for ${cleanEmail}`
      );


      // =================================================
      // RESPONSE
      // =================================================

      return res.status(200).json(
        complaints
      );

    }

    catch (error) {

      console.error(
        "GET CITIZEN COMPLAINTS ERROR:",
        error
      );


      return res.status(500).json({

        message:
          "Error fetching citizen complaints."

      });

    }

  };