import multer from "multer";
import path from "path";
import fs from "fs";

const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const createImageUploader = (uploadPath) => {
  ensureDir(uploadPath);

  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
      const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
      cb(null, uniqueName);
    },
  });

  const fileFilter = (req, file, cb) => {
    const allowedTypes = [".jpg", ".jpeg", ".png", ".webp"];
    const ext = path.extname(file.originalname).toLowerCase();

    if (!allowedTypes.includes(ext)) {
      return cb(new Error("Only JPG, JPEG, PNG, WEBP files are allowed"));
    }

    cb(null, true);
  };

  return multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 },
  });
};

export const foodUpload = createImageUploader("uploads/foods");
export const categoryUpload = createImageUploader("uploads/categories");
export const avatarUpload = createImageUploader("uploads/avatars");
export const communityUpload = createImageUploader("uploads/community");
