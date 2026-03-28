const multer = require("multer");
const path = require("path");

// Temporary storage for uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

// File filter for spreadsheet types
const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
        "text/csv"
    ];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Format file tidak didukung. Gunakan .xlsx, .xls, atau .csv"), false);
    }
};

const upload = multer({ 
    storage, 
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

module.exports = upload;
