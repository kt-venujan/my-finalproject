// i use this file front end  contact page  user click send meg then this file will save the data in databaseimport mongoose from "mongoose";
import mongoose from "mongoose";
const contactSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    message: String,
    isRead: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

export default mongoose.model("Contact", contactSchema);