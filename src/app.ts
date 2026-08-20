import path from "path";
import crypto from "crypto";
import express, { Application, NextFunction, Request, Response } from "express";
import cors, { CorsOptions } from "cors";
import helmet from "helmet";
import mongoose from "mongoose";
import authRoutes from "./routes/v1/auth.routes";
import userRoutes from "./routes/v1/user.routes";
import publicationRoutes from "./routes/v1/publication.routes";
import statsRoutes from "./routes/v1/stats.routes";
import membersRoutes from "./routes/v1/members.stats";
import commentRoutes from "./routes/v1/comment.routes";
import notificationRoutes from "./routes/v1/notification.routes";
import newsRoutes from "./routes/v1/news.routes";
import eventRoutes from "./routes/v1/events.routes";
import paymentRoutes from "./routes/v1/payment.routes";
import titleRoutes from "./routes/v1/ai.title";
import membershipFormRoutes from "./routes/v1/membershipform.routes";
import planRoutes from "./routes/v1/plan.routes";
import { handleWebhook } from "./controllers/webhook";
import { apiLimiter, authLimiter } from "./utils/rate.limiting";
import { errorHandler, notFound } from "./middleware/error.middleware";

const defaultOrigins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://naape-frontend.onrender.com",
    "https://naape.ng",
    "https://www.naape.ng",
];

const allowedOrigins = new Set([
    ...defaultOrigins,
    ...(process.env.CORS_ORIGINS || "")
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean),
]);

const corsOptions: CorsOptions = {
    origin(origin, callback) {
        // Requests without an Origin are server-to-server, CLI, or same-origin requests.
        if (!origin || allowedOrigins.has(origin)) return callback(null, true);
        const error = new Error("Origin is not allowed by CORS") as Error & { status: number };
        error.status = 403;
        callback(error);
    },
    methods: ["GET", "HEAD", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Authorization", "Content-Type", "X-Request-Id"],
    credentials: true,
    maxAge: 86400,
};

export const createApp = (): Application => {
    const app = express();

    app.disable("x-powered-by");
    app.set("trust proxy", 1);

    app.use((req: Request, res: Response, next: NextFunction) => {
        const requestId = req.header("x-request-id")?.slice(0, 100) || crypto.randomUUID();
        res.setHeader("X-Request-Id", requestId);
        res.locals.requestId = requestId;
        next();
    });
    app.use(helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'"],
                styleSrc: ["'self'"],
                imgSrc: ["'self'", "data:"],
                connectSrc: ["'self'"],
                fontSrc: ["'self'"],
                objectSrc: ["'none'"],
                frameAncestors: ["'none'"],
                baseUri: ["'self'"],
                formAction: ["'self'"],
            },
        },
    }));
    app.use(cors(corsOptions));

    // Flutterwave signs JSON webhooks. Keep this endpoint before the general parser and
    // retain the exact bytes in case signature verification changes to an HMAC scheme.
    app.post(
        "/webhook/flutterwave",
        express.json({ limit: "1mb", verify: (req, _res, buffer) => { (req as any).rawBody = buffer; } }),
        handleWebhook
    );

    app.use(express.json({ limit: "1mb" }));
    app.use(express.urlencoded({ extended: false, limit: "1mb" }));
    app.use("/api/v1", apiLimiter);

    app.use("/api/v1/auth", authLimiter, authRoutes);
    app.use("/api/v1/users", userRoutes);
    app.use("/api/v1/publications", publicationRoutes);
    app.use("/api/v1/stats", statsRoutes);
    app.use("/api/v1/member-dashboard", membersRoutes);
    app.use("/api/v1/comments", commentRoutes);
    app.use("/api/v1/notifications", notificationRoutes);
    app.use("/api/v1/news", newsRoutes);
    app.use("/api/v1/events", eventRoutes);
    app.use("/api/v1/payments", paymentRoutes);
    app.use("/api/v1/ai-title", titleRoutes);
    app.use("/api/v1/membership-form", membershipFormRoutes);
    app.use("/api/v1/plans", planRoutes);
    // Backwards-compatible alias used by the existing frontend.
    app.use("/api/v1/admin/plans", planRoutes);

    app.get("/health", (_req, res) => {
        const database = mongoose.connection.readyState === 1 ? "connected" : "disconnected";
        res.status(database === "connected" ? 200 : 503).json({
            status: database === "connected" ? "ok" : "degraded",
            service: "naape-api",
            database,
            uptime: Math.round(process.uptime()),
            timestamp: new Date().toISOString(),
        });
    });

    app.get("/api/v1", (_req, res) => {
        res.json({
            name: "NAAPE API",
            version: "1.0.0",
            status: "online",
            documentation: "/",
            health: "/health",
        });
    });

    app.use(express.static(path.join(__dirname, "../public"), { maxAge: "1h", index: false }));
    app.get("/", (_req, res) => res.sendFile(path.join(__dirname, "../public/index.html")));

    app.use(notFound);
    app.use(errorHandler);
    return app;
};

export default createApp();
