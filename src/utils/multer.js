import multer from "multer";
import path from "path";

// Configure storage
const storage = multer.diskStorage({
  destination: "uploads/", // Folder where images are saved
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname); // .jpg, .png, etc
    const uniqueName =
      Date.now() + "-" + Math.round(Math.random() * 1e9) + ext;
    cb(null, uniqueName); // e.g. 1694523456789-123456789.png
  },
});

// Multer instance
const upload = multer({ storage });

export default upload;
