import {mkdirSync} from "node:fs";
import path from "node:path";
import {randomUUID} from "node:crypto";
import multer from "multer";

export const uploadDirectory = process.env.UPLOAD_DIR ?? path.resolve(process.cwd(), "uploads");
mkdirSync(uploadDirectory, {recursive: true});

const storage = multer.diskStorage({
    destination: uploadDirectory,
    filename: (_req, file, callback) => {
        const extension = path.extname(file.originalname).toLowerCase() || ".jpg";
        callback(null, `${randomUUID()}${extension}`);
    },
});

export const uploadRecipeImage = multer({
    storage,
    limits: {fileSize: 5 * 1024 * 1024},
    fileFilter: (_req, file, callback) => {
        callback(null, ["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.mimetype));
    },
});
