import DieticianProfile from "../models/DieticianProfile.js";
import multer from "multer";
import path from "path";
import fs from "fs";

// ============================================================
// MULTER SETUP FOR CERTIFICATES
// ============================================================
const certPath = "uploads/certificates";

if (!fs.existsSync(certPath)) {
  fs.mkdirSync(certPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, certPath),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, unique);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = [".pdf", ".jpg", ".jpeg", ".png"];
  const ext = path.extname(file.originalname).toLowerCase();
  if (!allowed.includes(ext)) {
    return cb(new Error("Only PDF, JPG, JPEG, PNG allowed"));
  }
  cb(null, true);
};

export const uploadCert = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).single("certificate");

// ============================================================
// CREATE OR UPDATE PROFILE
// ============================================================
export const createProfile = async (req, res) => {
  try {
    const { specialization, bio, experience, price, availableSlots } = req.body;

    const existing = await DieticianProfile.findOne({ user: req.user._id });

    const certUrl = req.file
      ? `${req.protocol}://${req.get("host")}/uploads/certificates/${req.file.filename}`
      : undefined;

    if (existing) {
      // UPDATE
      existing.specialization = specialization || existing.specialization;
      existing.bio = bio || existing.bio;
      existing.experience = experience || existing.experience;
      existing.price = price || existing.price;
      if (availableSlots) {
        existing.availableSlots = JSON.parse(availableSlots);
      }
      if (certUrl) {
        existing.certificateUrl = certUrl;
        existing.certificateStatus = "pending";
        existing.isVerified = false;
        existing.rejectionReason = "";
      }
      await existing.save();
      return res.json(existing);
    }

    // CREATE NEW
    const profile = await DieticianProfile.create({
      user: req.user._id,
      specialization,
      bio: bio || "",
      experience: experience || 0,
      price: price || 1500,
      certificateUrl: certUrl || "",
      certificateStatus: certUrl ? "pending" : "not_uploaded",
      availableSlots: availableSlots ? JSON.parse(availableSlots) : undefined,
    });

    res.status(201).json(profile);
  } catch (err) {
    console.error("Create Profile Error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ============================================================
// GET MY PROFILE (dietician)
// ============================================================
export const getMyProfile = async (req, res) => {
  try {
    const profile = await DieticianProfile.findOne({ user: req.user._id }).populate("user", "username email");
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ============================================================
// GET ALL DIETICIANS (public)
// ============================================================
export const getDieticians = async (req, res) => {
  try {
    const list = await DieticianProfile.find({ isAvailable: true })
      .populate("user", "username email")
      .sort({ rating: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ============================================================
// GET ALL (admin — including unavailable/all certs)
// ============================================================
export const getAllDieticiansAdmin = async (req, res) => {
  try {
    const list = await DieticianProfile.find()
      .populate("user", "username email")
      .sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ============================================================
// ADMIN — APPROVE CERTIFICATE
// ============================================================
export const approveCertificate = async (req, res) => {
  try {
    const profile = await DieticianProfile.findById(req.params.profileId);
    if (!profile) return res.status(404).json({ message: "Profile not found" });

    profile.certificateStatus = "approved";
    profile.isVerified = true;
    profile.rejectionReason = "";
    await profile.save();

    res.json({ message: "Certificate approved", profile });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ============================================================
// ADMIN — REJECT CERTIFICATE
// ============================================================
export const rejectCertificate = async (req, res) => {
  try {
    const { reason } = req.body;
    const profile = await DieticianProfile.findById(req.params.profileId);
    if (!profile) return res.status(404).json({ message: "Profile not found" });

    profile.certificateStatus = "rejected";
    profile.isVerified = false;
    profile.rejectionReason = reason || "Certificate not valid";
    await profile.save();

    res.json({ message: "Certificate rejected", profile });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};