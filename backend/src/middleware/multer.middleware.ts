import multer from "multer";
import path from "node:path";
import type { NextFunction, Request, Response } from "express";
import { sendErrorResponse } from "../lib/error-response";

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

export function uploadSingleImage(req: Request, res: Response, next: NextFunction): void {
  upload.single("image")(req, res, (error: unknown) => {
    if (!error) {
      next();
      return;
    }

    if (error instanceof multer.MulterError) {
      if (error.code === "LIMIT_FILE_SIZE") {
        sendErrorResponse(res, 413, "Image file is too large. Maximum size is 5MB.");
        return;
      }

      sendErrorResponse(res, 400, error.message);
      return;
    }

    const message = error instanceof Error ? error.message : "Invalid image upload";
    sendErrorResponse(res, 400, message);
  });
}

export { upload };
