import DieticianProfile from "../models/DieticianProfile.js";

// CREATE PROFILE
export const createProfile = async (req, res) => {
  try {
    const profile = await DieticianProfile.create({
      user: req.user._id,
      specialization: req.body.specialization,
      experience: req.body.experience,
      price: req.body.price,
      certificateUrl: req.file?.path,
    });

    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET ALL DIETICIANS
export const getDieticians = async (req, res) => {
  const list = await DieticianProfile.find().populate("user", "username email");
  res.json(list);
};