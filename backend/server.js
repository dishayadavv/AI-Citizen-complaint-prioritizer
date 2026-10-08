const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

require("dotenv").config();

const app = express();

app.use(cors());

app.use(express.json());

app.use(
  "/uploads",
  express.static("uploads")
);


// ===============================
// ROUTES
// ===============================

const complaintRoutes =
  require("./routes/complaintRoutes");

const citizenRoutes =
  require("./routes/citizenRoutes");

const adminRoutes =
  require("./routes/adminRoutes");

const chatRoutes =
  require("./routes/chatRoutes");


// ===============================
// API ROUTES
// ===============================

app.use(
  "/api/complaints",
  complaintRoutes
);

app.use(
  "/api/citizens",
  citizenRoutes
);

app.use(
  "/api/admin",
  adminRoutes
);

app.use(
  "/api/chat",
  chatRoutes
);


// ===============================
// ROOT ROUTE
// ===============================

app.get("/", (req, res) => {
  res.send(
    "AI Citizen Complaint Prioritizer Backend is Running!"
  );
});


// ===============================
// MONGODB CONNECTION
// ===============================

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {

    console.log(
      "MongoDB connected successfully!"
    );

  })
  .catch((error) => {

    console.error(
      "MongoDB connection error:",
      error
    );

  });


// ===============================
// SERVER
// ===============================

const PORT =
  process.env.PORT || 5000;

app.listen(
  PORT,
  () => {

    console.log(
      `Server running on http://localhost:${PORT}`
    );

  }
);