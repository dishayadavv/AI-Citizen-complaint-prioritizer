const jwt = require("jsonwebtoken");


// =====================================================
// ADMIN AUTHENTICATION MIDDLEWARE
// =====================================================

const adminAuth = (req, res, next) => {

  try {

    const authHeader =
      req.headers.authorization;


    // =================================================
    // CHECK AUTHORIZATION HEADER
    // =================================================

    if (!authHeader) {

      return res.status(401).json({

        message:
          "Admin authentication required."

      });

    }


    // =================================================
    // CHECK BEARER FORMAT
    // =================================================

    if (
      !authHeader.startsWith("Bearer ")
    ) {

      return res.status(401).json({

        message:
          "Invalid authentication format."

      });

    }


    // =================================================
    // GET TOKEN
    // =================================================

    const token =
      authHeader.split(" ")[1];


    if (!token) {

      return res.status(401).json({

        message:
          "Authentication token missing."

      });

    }


    // =================================================
    // VERIFY JWT
    // =================================================

    const decoded =
      jwt.verify(
        token,
        process.env.JWT_SECRET
      );


    // =================================================
    // CHECK ADMIN ROLE
    // =================================================

    if (
      !decoded.role ||
      decoded.role !== "admin"
    ) {

      return res.status(403).json({

        message:
          "Admin access required."

      });

    }


    // =================================================
    // STORE ADMIN INFORMATION
    // =================================================

    req.admin =
      decoded;


    // =================================================
    // CONTINUE
    // =================================================

    next();

  }

  catch (error) {

    console.error(
      "ADMIN AUTH ERROR:",
      error.message
    );


    // =================================================
    // EXPIRED TOKEN
    // =================================================

    if (
      error.name === "TokenExpiredError"
    ) {

      return res.status(401).json({

        message:
          "Admin session has expired."

      });

    }


    // =================================================
    // INVALID TOKEN
    // =================================================

    return res.status(401).json({

      message:
        "Invalid admin authentication token."

    });

  }

};


// =====================================================
// EXPORT
// =====================================================

module.exports =
  adminAuth;