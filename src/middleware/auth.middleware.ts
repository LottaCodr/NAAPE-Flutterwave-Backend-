import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import User from "../models/User";

interface DecodedToken extends JwtPayload {
    id: string;
    role: "admin" | "editor" | "member";
}

const bearerToken = (req: Request): string | undefined => {
    const [scheme, token] = (req.headers.authorization || "").trim().split(/\s+/);
    return scheme?.toLowerCase() === "bearer" && token ? token : undefined;
};

const secret = () => {
    if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is not configured");
    return process.env.JWT_SECRET;
};

export const protect = async (req: Request, res: Response, next: NextFunction) => {
    const token = bearerToken(req);
    if (!token) {
        return res.status(401).json({ success: false, code: "UNAUTHORIZED", message: "Authentication is required" });
    }

    try {
        const decoded = jwt.verify(token, secret()) as DecodedToken;
        const user = await User.findById(decoded.id).select("-password -resetPasswordToken -resetPasswordExpire");
        if (!user) {
            return res.status(401).json({ success: false, code: "UNAUTHORIZED", message: "Account no longer exists" });
        }
        req.user = user;
        next();
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
            return res.status(401).json({ success: false, code: "INVALID_TOKEN", message: "Your session is invalid or has expired" });
        }
        next(error);
    }
};

export const optionalProtect = async (req: Request, _res: Response, next: NextFunction) => {
    const token = bearerToken(req);
    if (!token) return next();

    try {
        const decoded = jwt.verify(token, secret()) as DecodedToken;
        const user = await User.findById(decoded.id).select("-password -resetPasswordToken -resetPasswordExpire");
        if (user) req.user = user;
    } catch {
        // Optional authentication intentionally treats invalid credentials as guest access.
    }
    next();
};
