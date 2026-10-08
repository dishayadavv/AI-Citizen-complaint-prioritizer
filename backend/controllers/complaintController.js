const Complaint = require("../models/Complaint");

const {
  analyzeComplaint
} = require("../utils/priorityAI");


// =====================================================
// DETERMINE PRIORITY LEVEL
// =====================================================

function determinePriorityLevel(priorityScore) {

  if (priorityScore >= 80) {
    return "Critical";
  }

  if (priorityScore >= 60) {
    return "High";
  }

  if (priorityScore >= 40) {
    return "Medium";
  }

  return "Low";

}


// =====================================================
// CREATE COMPLAINT
// =====================================================

exports.createComplaint = async (req, res) => {

  try {

    console.log(
      "CREATE COMPLAINT REQUEST:",
      req.body
    );


    // =================================================
    // PARSE CITIZEN DATA
    // =================================================

    let citizenInput =
      req.body.citizen;


    if (
      typeof citizenInput === "string"
    ) {

      try {

        citizenInput =
          JSON.parse(citizenInput);

      }

      catch (error) {

        console.warn(
          "Could not parse citizen data:",
          error.message
        );

        citizenInput = {};

      }

    }


    // =================================================
    // PARSE LOCATION DATA
    // =================================================

    let locationInput =
      req.body.location;


    if (
      typeof locationInput === "string"
    ) {

      try {

        locationInput =
          JSON.parse(locationInput);

      }

      catch (error) {

        console.warn(
          "Could not parse location data:",
          error.message
        );

        locationInput = {

          address:
            locationInput

        };

      }

    }


    // =================================================
    // ENSURE LOCATION OBJECT
    // =================================================

    if (
      !locationInput ||
      typeof locationInput !== "object"
    ) {

      locationInput = {

        address:
          String(
            locationInput || ""
          )

      };

    }


    // =================================================
    // CITIZEN DATA
    // =================================================

    const citizenData = {

      name:
        citizenInput?.name ||
        req.body.citizenName ||
        req.body.userName ||
        "Unknown Citizen",

      email:
        citizenInput?.email ||
        req.body.citizenEmail ||
        req.body.userEmail ||
        req.body.email ||
        "",

      phone:
        citizenInput?.phone ||
        req.body.phone ||
        ""

    };


    // =================================================
    // NORMALIZE EMAIL
    // =================================================

    if (citizenData.email) {

      citizenData.email =
        citizenData.email
          .toLowerCase()
          .trim();

    }


    console.log(
      "CITIZEN DATA:",
      citizenData
    );


    // =================================================
    // COMPLAINT DATA
    // =================================================

    const complaintData = {

      ...req.body,

      citizen:
        citizenData,

      location:
        locationInput

    };


    // =================================================
    // PHOTO UPLOAD
    // =================================================

    if (req.file) {

      complaintData.photo =
        `/uploads/${req.file.filename}`;


      console.log(
        "PHOTO UPLOADED:",
        complaintData.photo
      );

    }

    else {

      complaintData.photo = "";


      console.log(
        "NO PHOTO UPLOADED"
      );

    }


    // =================================================
    // CREATE DOCUMENT
    // =================================================

    const complaint =
      new Complaint(
        complaintData
      );


    // =================================================
    // FIND SIMILAR COMPLAINTS
    // =================================================
    // We calculate this BEFORE AI analysis so that
    // repeated complaints can influence AI priority.

    const similarComplaints =
      await Complaint.countDocuments({

        category:
          complaint.category,

        "location.address":
          complaint.location?.address

      });


    complaint.similarComplaints =
      similarComplaints;


    console.log(
      "SIMILAR COMPLAINTS:",
      similarComplaints
    );


    // =================================================
    // AI ANALYSIS
    // =================================================
    // The AI receives the complete complaint context.

    const aiAnalysis =
      analyzeComplaint(

        complaint.title,

        complaint.description,

        complaint.category,

        complaint.severity,

        complaint.location?.address,

        Boolean(
          complaint.photo
        ),

        complaint.similarComplaints

      );


    // =================================================
    // SAVE AI SCORE
    // =================================================

    complaint.aiScore =
      aiAnalysis.aiScore;


    complaint.aiLevel =
      aiAnalysis.detectedLevel;


    complaint.aiReasons =
      aiAnalysis.aiReasons;


    // =================================================
    // SAVE AI FACTORS
    // =================================================

    // These fields may not exist in older documents,
    // but Mongoose can safely store them if the schema
    // is updated accordingly.

    if (
      Array.isArray(
        aiAnalysis.detectedFactors
      )
    ) {

      complaint.set(
        "detectedFactors",
        aiAnalysis.detectedFactors
      );

    }


    // =================================================
    // SAVE AI RECOMMENDATION
    // =================================================

    if (
      aiAnalysis.recommendedAction
    ) {

      complaint.set(
        "recommendedAction",
        aiAnalysis.recommendedAction
      );

    }


    // =================================================
    // SAVE PREDICTED RESOLUTION TIME
    // =================================================

    if (
      aiAnalysis.predictedResolutionTime
    ) {

      complaint.predictedResolutionTime =
        aiAnalysis.predictedResolutionTime;

    }


    console.log(
      "AI ANALYSIS:",
      aiAnalysis
    );


    // =================================================
    // FINAL PRIORITY
    // =================================================
    //
    // The upgraded AI already considers:
    //
    // - safety
    // - urgency
    // - public impact
    // - infrastructure
    // - duration
    // - citizen severity
    // - category
    // - location
    // - repeated complaints
    // - photo evidence
    //
    // Therefore we DO NOT add those factors again.
    //
    // This prevents double-counting.
    // =================================================

    let priorityScore =
      Number(
        aiAnalysis.aiScore
      ) || 0;


    // Keep score between 0 and 100.

    priorityScore =
      Math.max(
        0,
        Math.min(
          100,
          Math.round(
            priorityScore
          )
        )
      );


    complaint.priorityScore =
      priorityScore;


    // =================================================
    // PRIORITY LEVEL
    // =================================================

    complaint.priorityLevel =
      determinePriorityLevel(
        priorityScore
      );


    // =================================================
    // DEBUG
    // =================================================

    console.log(
      "PRIORITY CALCULATION:",
      {

        citizen:
          complaint.citizen,

        severity:
          complaint.severity,

        category:
          complaint.category,

        location:
          complaint.location?.address,

        similarComplaints:
          complaint.similarComplaints,

        photo:
          complaint.photo,

        aiScore:
          complaint.aiScore,

        aiLevel:
          complaint.aiLevel,

        priorityScore:
          complaint.priorityScore,

        priorityLevel:
          complaint.priorityLevel,

        predictedResolutionTime:
          complaint.predictedResolutionTime

      }
    );


    // =================================================
    // SAVE
    // =================================================

    await complaint.save();


    console.log(
      "COMPLAINT SAVED:",
      complaint._id
    );


    console.log(
      "SAVED CITIZEN:",
      complaint.citizen
    );


    console.log(
      "SAVED PHOTO:",
      complaint.photo
    );


    // =================================================
    // RESPONSE
    // =================================================

    res.status(201).json({

      message:
        "Complaint submitted successfully",

      complaint:
        complaint,

      aiAnalysis:
        aiAnalysis

    });

  }

  catch (error) {

    console.error(
      "CREATE COMPLAINT ERROR:",
      error
    );


    res.status(500).json({

      message:
        "Error submitting complaint",

      error:
        error.message

    });

  }

};


// =====================================================
// GET ALL COMPLAINTS
// =====================================================

exports.getComplaints = async (req, res) => {

  try {

    const complaints =
      await Complaint.find()
        .sort({
          createdAt: -1
        });


    res.status(200).json(
      complaints
    );

  }

  catch (error) {

    console.error(
      "GET COMPLAINTS ERROR:",
      error
    );


    res.status(500).json({

      message:
        "Error fetching complaints",

      error:
        error.message

    });

  }

};


// =====================================================
// GET COMPLAINTS FOR SPECIFIC CITIZEN
// =====================================================

exports.getCitizenComplaints =
  async (req, res) => {

    try {

      let email =
        req.params.email || "";


      // =================================================
      // DECODE EMAIL
      // =================================================

      try {

        email =
          decodeURIComponent(email);

      }

      catch (decodeError) {

        console.log(
          "Email decode warning:",
          decodeError.message
        );

      }


      // =================================================
      // NORMALIZE EMAIL
      // =================================================

      email =
        email
          .toLowerCase()
          .trim();


      console.log(
        "======================================"
      );

      console.log(
        "GET CITIZEN COMPLAINTS"
      );

      console.log(
        "EMAIL:",
        email
      );

      console.log(
        "======================================"
      );


      // =================================================
      // VALIDATE EMAIL
      // =================================================

      if (!email) {

        return res.status(400).json({

          message:
            "Citizen email is required."

        });

      }


      // =================================================
      // FIND COMPLAINTS
      // =================================================

      const complaints =
        await Complaint.find({

          "citizen.email": {

            $regex:
              `^${escapeRegex(email)}$`,

            $options:
              "i"

          }

        })
        .sort({

          createdAt:
            -1

        });


      // =================================================
      // DEBUG
      // =================================================

      console.log(
        `FOUND ${complaints.length} COMPLAINTS FOR ${email}`
      );


      if (
        complaints.length > 0
      ) {

        complaints.forEach(
          (complaint, index) => {

            console.log(
              `Complaint ${index + 1}:`,
              {

                id:
                  complaint._id,

                title:
                  complaint.title,

                citizen:
                  complaint.citizen,

                status:
                  complaint.status,

                photo:
                  complaint.photo,

                aiScore:
                  complaint.aiScore,

                aiLevel:
                  complaint.aiLevel,

                priorityScore:
                  complaint.priorityScore,

                priorityLevel:
                  complaint.priorityLevel

              }
            );

          }
        );

      }


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
          "Error fetching citizen complaints.",

        error:
          error.message

      });

    }

  };


// =====================================================
// ESCAPE REGEX
// =====================================================

function escapeRegex(text) {

  return text.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );

}


// =====================================================
// GET ONE COMPLAINT BY ID
// =====================================================

exports.getComplaintById =
  async (req, res) => {

    try {

      const complaintId =
        req.params.id;


      // =================================================
      // VALIDATE COMPLAINT ID
      // =================================================

      const mongoose =
        require("mongoose");


      if (
        !mongoose.Types.ObjectId.isValid(
          complaintId
        )
      ) {

        return res.status(400).json({

          message:
            "Invalid complaint ID"

        });

      }


      // =================================================
      // FIND COMPLAINT
      // =================================================

      const complaint =
        await Complaint.findById(
          complaintId
        );


      // =================================================
      // NOT FOUND
      // =================================================

      if (!complaint) {

        return res.status(404).json({

          message:
            "Complaint not found"

        });

      }


      // =================================================
      // RESPONSE
      // =================================================

      return res.status(200).json({

        complaint:
          complaint

      });

    }

    catch (error) {

      console.error(
        "GET COMPLAINT BY ID ERROR:",
        error
      );


      return res.status(500).json({

        message:
          "Error fetching complaint",

        error:
          error.message

      });

    }

  };


// =====================================================
// UPDATE COMPLAINT STATUS
// =====================================================

exports.updateComplaintStatus =
  async (req, res) => {

    try {

      const {
        status
      } = req.body;


      const validStatuses = [

        "Pending",

        "In Progress",

        "Resolved"

      ];


      if (
        !validStatuses.includes(status)
      ) {

        return res.status(400).json({

          message:
            "Invalid status"

        });

      }


      const complaint =
        await Complaint.findByIdAndUpdate(

          req.params.id,

          {

            status:
              status

          },

          {

            new: true,

            runValidators: true

          }

        );


      if (!complaint) {

        return res.status(404).json({

          message:
            "Complaint not found"

        });

      }


      res.status(200).json({

        message:
          "Complaint status updated successfully",

        complaint:
          complaint

      });

    }

    catch (error) {

      console.error(
        "UPDATE STATUS ERROR:",
        error
      );


      res.status(500).json({

        message:
          "Error updating complaint status",

        error:
          error.message

      });

    }

  };


// =====================================================
// RE-ANALYZE ALL COMPLAINTS
// =====================================================

exports.reanalyzeComplaints =
  async (req, res) => {

    try {

      const complaints =
        await Complaint.find();


      let updatedCount = 0;


      for (
        const complaint of complaints
      ) {

        // =================================================
        // RECALCULATE SIMILAR COMPLAINTS
        // =================================================
        // Exclude the current complaint itself.

        const similarComplaints =
          await Complaint.countDocuments({

            _id: {
              $ne:
                complaint._id
            },

            category:
              complaint.category,

            "location.address":
              complaint.location?.address

          });


        complaint.similarComplaints =
          similarComplaints;


        // =================================================
        // AI ANALYSIS
        // =================================================

        const aiAnalysis =
          analyzeComplaint(

            complaint.title,

            complaint.description,

            complaint.category,

            complaint.severity,

            complaint.location?.address,

            Boolean(
              complaint.photo
            ),

            complaint.similarComplaints

          );


        // =================================================
        // SAVE AI DATA
        // =================================================

        complaint.aiScore =
          aiAnalysis.aiScore;


        complaint.aiLevel =
          aiAnalysis.detectedLevel;


        complaint.aiReasons =
          aiAnalysis.aiReasons;


        // =================================================
        // SAVE NEW AI FIELDS
        // =================================================

        if (
          Array.isArray(
            aiAnalysis.detectedFactors
          )
        ) {

          complaint.set(
            "detectedFactors",
            aiAnalysis.detectedFactors
          );

        }


        if (
          aiAnalysis.recommendedAction
        ) {

          complaint.set(
            "recommendedAction",
            aiAnalysis.recommendedAction
          );

        }


        if (
          aiAnalysis.predictedResolutionTime
        ) {

          complaint.predictedResolutionTime =
            aiAnalysis.predictedResolutionTime;

        }


        // =================================================
        // FINAL PRIORITY
        // =================================================

        let priorityScore =
          Number(
            aiAnalysis.aiScore
          ) || 0;


        priorityScore =
          Math.max(
            0,
            Math.min(
              100,
              Math.round(
                priorityScore
              )
            )
          );


        complaint.priorityScore =
          priorityScore;


        complaint.priorityLevel =
          determinePriorityLevel(
            priorityScore
          );


        // =================================================
        // SAVE
        // =================================================

        await complaint.save();


        updatedCount++;

      }


      console.log(
        `Re-analyzed ${updatedCount} complaints`
      );


      res.status(200).json({

        message:
          "All complaints re-analyzed successfully",

        updatedCount:
          updatedCount

      });

    }

    catch (error) {

      console.error(
        "RE-ANALYSIS ERROR:",
        error
      );


      res.status(500).json({

        message:
          "Error re-analyzing complaints",

        error:
          error.message

      });

    }

  };


// =====================================================
// GET COMPLAINT ANALYTICS
// =====================================================

exports.getComplaintAnalytics =
  async (req, res) => {

    try {

      const totalComplaints =
        await Complaint.countDocuments();


      const critical =
        await Complaint.countDocuments({

          priorityLevel:
            "Critical"

        });


      const high =
        await Complaint.countDocuments({

          priorityLevel:
            "High"

        });


      const medium =
        await Complaint.countDocuments({

          priorityLevel:
            "Medium"

        });


      const low =
        await Complaint.countDocuments({

          priorityLevel:
            "Low"

        });


      const pending =
        await Complaint.countDocuments({

          status:
            "Pending"

        });


      const inProgress =
        await Complaint.countDocuments({

          status:
            "In Progress"

        });


      const resolved =
        await Complaint.countDocuments({

          status:
            "Resolved"

        });


      // =================================================
      // CATEGORY DATA
      // =================================================

      const categoryData =
        await Complaint.aggregate([

          {

            $group: {

              _id:
                "$category",

              count: {

                $sum:
                  1

              }

            }

          },

          {

            $sort: {

              count:
                -1

              }

          }

        ]);


      // =================================================
      // AI DATA
      // =================================================

      const aiData =
        await Complaint.aggregate([

          {

            $group: {

              _id:
                "$aiLevel",

              count: {

                $sum:
                  1

              }

            }

          }

        ]);


      // =================================================
      // RESPONSE
      // =================================================

      res.status(200).json({

        totalComplaints,

        priority: {

          critical,

          high,

          medium,

          low

        },

        status: {

          pending,

          inProgress,

          resolved

        },

        categories:
          categoryData,

        aiLevels:
          aiData

      });

    }

    catch (error) {

      console.error(
        "ANALYTICS ERROR:",
        error
      );


      res.status(500).json({

        message:
          "Error fetching complaint analytics",

        error:
          error.message

      });

    }

  };