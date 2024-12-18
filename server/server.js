const express = require("express");
const multer = require("multer");
const mongoose = require("mongoose");
const Member = require("./models/Member");

const app = express();
const PORT = 5000;

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/core_committee", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Middleware for JSON parsing
app.use(express.json());

// Static folder for photos
app.use("/uploads", express.static("uploads"));

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads"),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

// Member schema and model
const memberSchema = new mongoose.Schema({
  name: String,
  designation: String,
  profileLink: String,
  photo: String,
});
const Member = mongoose.model("Member", memberSchema);

// API Endpoints
app.get("/api/members", async (req, res) => {
  const members = await Member.find().sort({ designation: 1 });
  res.json(members);
});

app.post("/api/members", upload.single("photo"), async (req, res) => {
  try {
    const { name, designation, profileLink } = req.body;
    const photo = req.file ? req.file.filename : null;

    if (!name || !designation || !photo) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const newMember = new Member({ name, designation, profileLink, photo });
    await newMember.save();
    res.status(201).json(newMember);
  } catch (error) {
    console.error("Error adding member:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});


app.delete("/api/members/:id", async (req, res) => {
  const { id } = req.params;
  await Member.findByIdAndDelete(id);
  res.sendStatus(200);
});

// Start server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
