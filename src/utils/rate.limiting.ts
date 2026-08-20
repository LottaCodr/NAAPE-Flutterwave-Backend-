import rateLimit from "express-rate-limit";

const response = (message: string) => ({
    success: false,
    code: "RATE_LIMITED",
    message,
});

export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: response("Too many requests. Please try again later."),
});

export const authLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    limit: 15,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    message: response("Too many authentication attempts. Please try again in 10 minutes."),
});

export const writeLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 10,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: response("You have reached the submission limit. Please try again later."),
});

export const aiLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 10,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: response("AI requests are limited to 10 per minute."),
});
