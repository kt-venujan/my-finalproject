import Chat from "../models/Chat.js";

// SEND MESSAGE
export const sendMessage = async (req, res) => {
  const msg = await Chat.create({
    booking: req.body.bookingId,
    sender: req.user._id,
    message: req.body.message,
  });

  res.json(msg);
};

// GET CHAT
export const getChat = async (req, res) => {
  const messages = await Chat.find({ booking: req.params.bookingId })
    .populate("sender", "username");

  res.json(messages);
};