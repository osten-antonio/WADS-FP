import multer from "multer";
import path from "node:path";
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);
const ALLOWED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: {
        fileSize: MAX_UPLOAD_BYTES,
        files: 1,
    },
    fileFilter: (req, file, cb) => {
        const extension = path.extname(file.originalname || "").toLowerCase();
        const isAllowedMime = ALLOWED_MIME_TYPES.has(file.mimetype);
        const isAllowedExtension = ALLOWED_EXTENSIONS.has(extension);
        if (!isAllowedMime || !isAllowedExtension) {
            cb(new Error("Invalid file type. Only JPG, JPEG, PNG, and WEBP are allowed."));
            return;
        }
        cb(null, true);
    },
});
export function uploadSingleImage(req, res, next) {
    upload.single("image")(req, res, (error) => {
        if (!error) {
            next();
            return;
        }
        if (error instanceof multer.MulterError) {
            if (error.code === "LIMIT_FILE_SIZE") {
                res.status(413).json({ message: "Image file is too large. Maximum size is 5MB." });
                return;
            }
            res.status(400).json({ message: error.message });
            return;
        }
        const message = error instanceof Error ? error.message : "Invalid image upload";
        res.status(400).json({ message });
    });
}
export { upload };
//# sourceMappingURL=multer.middleware.js.map