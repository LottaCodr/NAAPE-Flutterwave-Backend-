import "dotenv/config";
import app from "./app";
import { connectDB } from "./config/db";

const PORT = Number(process.env.PORT) || 5000;

const requiredInProduction = ["MONGO_URI", "JWT_SECRET", "FLW_SECRET_KEY", "FLW_HASH"];

const start = async () => {
    if (process.env.NODE_ENV === "production") {
        const missing = requiredInProduction.filter((key) => !process.env[key]);
        if (missing.length) {
            throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
        }
    }

    await connectDB();
    const server = app.listen(PORT, "0.0.0.0", () => {
        console.log(`NAAPE API listening on port ${PORT}`);
    });

    const shutdown = (signal: string) => {
        console.log(`${signal} received; shutting down gracefully`);
        server.close(() => process.exit(0));
        setTimeout(() => process.exit(1), 10_000).unref();
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
};

start().catch((error) => {
    console.error("Unable to start NAAPE API:", error instanceof Error ? error.message : error);
    process.exit(1);
});
