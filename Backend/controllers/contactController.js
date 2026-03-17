import Contact from "../models/contactModel.js";

export const sendContact = async (req, res) => {
  try {

    const { name, email, message } = req.body;

    const contact = await Contact.create({
      name,
      email,
      message
    });

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: contact
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getContacts = async (req, res) => {

  const contacts = await Contact.find().sort({ createdAt: -1 });

  res.json(contacts);

};