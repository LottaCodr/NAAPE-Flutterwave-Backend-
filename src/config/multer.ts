import multer from "multer";
import path from "path";
import { UploadApiOptions, UploadApiResponse } from "cloudinary";
import cloudinary from "./cloudinary";

class CloudinaryStorage implements multer.StorageEngine {
    constructor(private readonly folder: string, private readonly profile = false) {}

    _handleFile(_req: Express.Request, file: Express.Multer.File, callback: (error?: any, info?: Partial<Express.Multer.File>) => void) {
        const baseName = path.parse(file.originalname).name.replace(/[^a-zA-Z0-9-_]/g, "_").slice(0, 80);
        const options: UploadApiOptions = {
            folder: this.folder,
            public_id: `${baseName}-${Date.now()}`,
            resource_type: "image",
            allowed_formats: ["jpg", "jpeg", "png", "webp"],
            ...(this.profile ? {
                transformation: [{ width: 400, height: 400, crop: "fill", gravity: "face", quality: "auto", fetch_format: "auto" }],
            } : {}),
        };

        const stream = cloudinary.uploader.upload_stream(options, (error, result?: UploadApiResponse) => {
            if (error || !result) return callback(error || new Error("Cloud image upload failed"));
            callback(undefined, {
                path: result.secure_url,
                filename: result.public_id,
                size: result.bytes,
            } as Partial<Express.Multer.File>);
        });
        file.stream.pipe(stream);
    }

    _removeFile(_req: Express.Request, file: Express.Multer.File, callback: (error: Error | null) => void) {
        const publicId = file.filename;
        if (!publicId) return callback(null);
        cloudinary.uploader.destroy(publicId).then(() => callback(null)).catch(callback);
    }
}

const imageFilter: multer.Options["fileFilter"] = (_req, file, callback) => {
    const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
    const allowedExtensions = new Set([".jpg", ".jpeg", ".png", ".webp"]);
    if (allowedMimeTypes.has(file.mimetype.toLowerCase()) && allowedExtensions.has(path.extname(file.originalname).toLowerCase())) {
        return callback(null, true);
    }
    callback(new Error("Only JPG, PNG, and WebP images are allowed"));
};

export const uploadProfileImage = multer({
    storage: new CloudinaryStorage("profile", true),
    limits: { fileSize: 8 * 1024 * 1024, files: 1 },
    fileFilter: imageFilter,
});

export const upload = multer({
    storage: new CloudinaryStorage("naape-images"),
    limits: { fileSize: 10 * 1024 * 1024, files: 1 },
    fileFilter: imageFilter,
});
