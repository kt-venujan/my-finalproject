import express from "express";

const router = express.Router();

let emails = []; // temp storage (DB later)

router.post("/subscribe", (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email required" });
  }

  emails.push(email);

  res.status(200).json({ message: "Subscribed" });
});

export default router;