const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      required: true,
      trim: true
    },

    photo: {
      type: String,
      default: ""
    },

    citizen: {
      name: {
        type: String,
        trim: true,
        default: "Unknown Citizen"
      },

      email: {
        type: String,
        trim: true,
        lowercase: true,
        default: ""
      },

      phone: {
        type: String,
        trim: true,
        default: ""
      }
    },

    category: {
      type: String,
      required: true,
      enum: [
        "Road",
        "Garbage",
        "Water",
        "Electricity",
        "Streetlight",
        "Drainage",
        "Other"
      ]
    },

    location: {
      address: {
        type: String,
        required: true
      },

      latitude: {
        type: Number
      },

      longitude: {
        type: Number
      }
    },

    severity: {
      type: Number,
      min: 1,
      max: 5,
      default: 1
    },

    priorityScore: {
      type: Number,
      default: 0
    },

    priorityLevel: {
      type: String,
      enum: [
        "Low",
        "Medium",
        "High",
        "Critical"
      ],
      default: "Low"
    },

    // =====================================================
    // AI ANALYSIS
    // =====================================================

    aiScore: {
      type: Number,
      default: 0
    },

    aiLevel: {
      type: String,
      enum: [
        "Low",
        "Medium",
        "High",
        "Critical"
      ],
      default: "Low"
    },

    aiReasons: {
      type: [String],
      default: []
    },

    detectedFactors: {
      type: [String],
      default: []
    },

    recommendedAction: {
      type: String,
      default: ""
    },

    predictedResolutionTime: {
      type: Number,
      default: 0
    },

    // =====================================================
    // OTHER ANALYSIS DATA
    // =====================================================

    similarComplaints: {
      type: Number,
      default: 0
    },

    // =====================================================
    // STATUS
    // =====================================================

    status: {
      type: String,
      enum: [
        "Pending",
        "In Progress",
        "Resolved"
      ],
      default: "Pending"
    }
  },

  {
    timestamps: true
  }
);

module.exports =
  mongoose.model(
    "Complaint",
    complaintSchema
  );