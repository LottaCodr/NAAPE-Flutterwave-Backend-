import { ErrorRequestHandler, NextFunction, Request, Response } from "express";
import multer from "multer";

interface HttpError extends Error {
    status?: number;
    statusCode?: number;
    code?: number | string;
    keyPattern?: Record<string, unknown>;
}

export const notFound = (req: Request, res: Response) => {
    res.status(404).json({
        success: false,
        code: "ROUTE_NOT_FOUND",
        message: `Route ${req.method} ${req.originalUrl} was not found`,
        requestId: res.locals.requestId,
    });
};

export const errorHandler: ErrorRequestHandler = (
    error: HttpError,
    _req: Request,
    res: Response,
    _next: NextFunction
) => {
    let status = error.statusCode || error.status || 500;
    let code = "INTERNAL_SERVER_ERROR";
    let message = "Something went wrong. Please try again later.";

    if (error instanceof multer.MulterError) {
        status = 400;
        code = "UPLOAD_ERROR";
        message = error.code === "LIMIT_FILE_SIZE" ? "The uploaded image is too large" : error.message;
    } else if (error instanceof SyntaxError && "body" in error) {
        status = 400;
        code = "INVALID_JSON";
        message = "The request body contains invalid JSON";
    } else if (error.code === 11000) {
        status = 409;
        code = "DUPLICATE_RESOURCE";
        const field = Object.keys(error.keyPattern || {})[0] || "resource";
        message = `${field.charAt(0).toUpperCase()}${field.slice(1)} already exists`;
    } else if (error.name === "ValidationError") {
        status = 400;
        code = "VALIDATION_ERROR";
        message = error.message;
    } else if (error.name === "CastError") {
        status = 400;
        code = "INVALID_ID";
        message = "The supplied resource ID is invalid";
    } else if (status < 500 && error.message) {
        code = status === 403 ? "FORBIDDEN" : status === 401 ? "UNAUTHORIZED" : "REQUEST_ERROR";
        message = error.message;
    }

    if (status >= 500) console.error(`[${res.locals.requestId}]`, error);

    res.status(status).json({
        success: false,
        code,
        message,
        requestId: res.locals.requestId,
        ...(process.env.NODE_ENV === "development" && status >= 500 ? { detail: error.message } : {}),
    });
};
