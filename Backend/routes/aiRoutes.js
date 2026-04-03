import express from "express";
import multer from "multer";
import { GoogleGenerativeAI } from "@google/generative-ai";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

if (!process.env.GEMINI_API_KEY) {
  console.error("❌ GEMINI_API_KEY is missing in .env");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post(
  "/generate-diet-plan",
  upload.single("allergyReport"),
  async (req, res) => {
    try {
      console.log("✅ /generate-diet-plan hit");
      console.log("Body:", req.body);
      console.log("File:", req.file?.originalname || "No file");

      const {
        age = "",
        gender = "",
        height = "",
        weight = "",
        goal = "",
        foodPreference = "",
        allergies = "",
        hasAllergies = "No",
      } = req.body;

      const reportInfo = req.file
        ? `User uploaded allergy report: ${req.file.originalname}`
        : "No allergy report uploaded";

      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const prompt = `
You are a diet assistant.

Create a safe personalized meal plan.

User details:
- Age: ${age}
- Gender: ${gender}
- Height: ${height} cm
- Weight: ${weight} kg
- Goal: ${goal}
- Food Preference: ${foodPreference}
- Has Allergies: ${hasAllergies}
- Allergy Details: ${allergies}
- Report Info: ${reportInfo}

Rules:
- Strictly avoid allergy foods
- Suggest breakfast, lunch, and dinner
- Keep foods practical
- Return ONLY valid JSON
- Do not wrap JSON in markdown

Format:
{
  "calories": "...",
  "breakfast": ["...", "..."],
  "lunch": ["...", "..."],
  "dinner": ["...", "..."],
  "tips": ["...", "..."]
}
`;

      const result = await model.generateContent(prompt);
      const rawText = result.response.text();

      console.log("🔹 Gemini raw response:", rawText);

      const cleanedText = rawText.replace(/```json|```/g, "").trim();

      let parsed;
      try {
        parsed = JSON.parse(cleanedText);
      } catch (parseError) {
        console.error("❌ JSON parse failed");
        console.error("Cleaned text:", cleanedText);

        return res.status(500).json({
          message: "Gemini returned invalid JSON",
          raw: cleanedText,
        });
      }

      return res.json({ plan: parsed });
    } catch (error) {
      console.error("❌ generate-diet-plan error:");
      console.error(error);

      return res.status(500).json({
        message: "Failed to generate diet plan",
        error: error?.message || "Unknown error",
      });
    }
  }
);

export default router;