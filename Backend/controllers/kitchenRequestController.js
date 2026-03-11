import KitchenRequest from "../models/KitchenRequest.js";

const parseArrayField = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;

  try {
    return JSON.parse(value);
  } catch {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
};

const parsePreferredMealTimes = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;

  try {
    return JSON.parse(value);
  } catch {
    return [];
  }
};

// ✅ User create kitchen request
export const createKitchenRequest = async (req, res) => {
  try {
    const {
      age,
      gender,
      weight,
      height,
      phone,
      goal,
      medicalConditions,
      currentMedications,
      dietaryRestrictions,
      digestiveIssues,
      hasAllergies,
      allergyFoods,
      allergyNotes,
      foodPreference,
      mealsPerDay,
      numberOfDays,
      packageType,
      deliveryStartDate,
      preferredMealTimes,
      deliveryAddress,
      additionalNotes,
    } = req.body;

    if (
      !age ||
      !gender ||
      !weight ||
      !height ||
      !phone ||
      !goal ||
      !foodPreference ||
      !mealsPerDay ||
      !numberOfDays ||
      !packageType ||
      !deliveryStartDate ||
      !deliveryAddress
    ) {
      return res.status(400).json({ message: "Required fields are missing" });
    }

    const allergyReportUrl = req.file
      ? `/${req.file.path.replace(/\\/g, "/")}`
      : "";

    const request = await KitchenRequest.create({
      user: req.user._id,
      age,
      gender,
      weight,
      height,
      phone,
      goal,
      medicalConditions: parseArrayField(medicalConditions),
      currentMedications,
      dietaryRestrictions: parseArrayField(dietaryRestrictions),
      digestiveIssues,
      hasAllergies: hasAllergies === "true" || hasAllergies === true,
      allergyFoods: parseArrayField(allergyFoods),
      allergyNotes,
      allergyReportUrl,
      foodPreference,
      mealsPerDay,
      numberOfDays,
      packageType,
      deliveryStartDate,
      preferredMealTimes: parsePreferredMealTimes(preferredMealTimes),
      deliveryAddress,
      additionalNotes,
    });

    return res.status(201).json({
      success: true,
      message: "Dietary kitchen request submitted successfully",
      request,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ✅ User get own requests
export const getMyKitchenRequests = async (req, res) => {
  try {
    const requests = await KitchenRequest.find({ user: req.user._id })
      .populate("user", "username email role")
      .sort({ createdAt: -1 });

    return res.status(200).json(requests);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ✅ Kitchen/Admin/Dietician get all requests
export const getAllKitchenRequests = async (req, res) => {
  try {
    const requests = await KitchenRequest.find()
      .populate("user", "username email role")
      .sort({ createdAt: -1 });

    return res.status(200).json(requests);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ✅ Get single request
export const getKitchenRequestById = async (req, res) => {
  try {
    const request = await KitchenRequest.findById(req.params.id).populate(
      "user",
      "username email role"
    );

    if (!request) {
      return res.status(404).json({ message: "Kitchen request not found" });
    }

    return res.status(200).json(request);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ✅ Kitchen/Admin update request status
export const updateKitchenRequestStatus = async (req, res) => {
  try {
    const { status, kitchenNotes } = req.body;

    const request = await KitchenRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: "Kitchen request not found" });
    }

    if (status) {
      request.status = status;
    }

    if (kitchenNotes !== undefined) {
      request.kitchenNotes = kitchenNotes;
    }

    await request.save();

    return res.status(200).json({
      success: true,
      message: "Kitchen request updated successfully",
      request,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};