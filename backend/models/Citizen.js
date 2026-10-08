const mongoose = require("mongoose");

const citizenSchema = new mongoose.Schema(
  {

    // =========================================
    // CITIZEN NAME
    // =========================================

    name: {
      type: String,
      required: true,
      trim: true
    },


    // =========================================
    // EMAIL
    // =========================================

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },


    // =========================================
    // PHONE
    // =========================================

    phone: {
      type: String,
      trim: true,
      default: ""
    },


    // =========================================
    // PASSWORD
    // =========================================

    password: {
      type: String,
      required: true
    },


    // =========================================
    // ADDRESS
    // =========================================

    address: {
      type: String,
      trim: true,
      default: ""
    },


    // =========================================
    // CITY
    // =========================================

    city: {
      type: String,
      trim: true,
      default: ""
    },


    // =========================================
    // ACCOUNT STATUS
    // =========================================

    isActive: {
      type: Boolean,
      default: true
    }

  },


  // =========================================
  // TIMESTAMPS
  // =========================================

  {
    timestamps: true
  }

);


// =========================================
// EXPORT MODEL
// =========================================

module.exports = mongoose.model(
  "Citizen",
  citizenSchema
);