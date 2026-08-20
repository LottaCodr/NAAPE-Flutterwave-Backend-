import assert from "node:assert/strict";
import { describe, it } from "node:test";
import request from "supertest";
import app from "../src/app";

process.env.JWT_SECRET = "test-secret-that-is-long-enough";
process.env.NODE_ENV = "test";

describe("NAAPE API shell", () => {
    it("serves the API landing page", async () => {
        const response = await request(app).get("/");
        assert.equal(response.status, 200);
        assert.match(response.text, /Infrastructure for Nigeria/);
        assert.match(response.text, /id="endpoint-search"/);
        assert.match(response.headers["content-type"], /text\/html/);
        assert.match(response.headers["content-security-policy"], /default-src 'self'/);
        assert.ok(response.headers["x-request-id"]);
        assert.equal(response.headers["x-powered-by"], undefined);
    });

    it("returns machine-readable API metadata", async () => {
        const response = await request(app).get("/api/v1");
        assert.equal(response.status, 200);
        assert.equal(response.body.name, "NAAPE API");
        assert.equal(response.body.health, "/health");
    });

    it("reports a degraded health state without a database", async () => {
        const response = await request(app).get("/health");
        assert.equal(response.status, 503);
        assert.equal(response.body.status, "degraded");
        assert.equal(response.body.database, "disconnected");
    });

    it("rejects malformed registration input before database access", async () => {
        const response = await request(app).post("/api/v1/auth/register").send({
            name: "A",
            email: "not-an-email",
            password: "short",
            role: "admin",
        });
        assert.equal(response.status, 400);
        assert.equal(response.body.message, "Name must be at least 2 characters");
    });

    it("returns a consistent JSON 404", async () => {
        const response = await request(app).get("/does-not-exist");
        assert.equal(response.status, 404);
        assert.equal(response.body.code, "ROUTE_NOT_FOUND");
        assert.ok(response.body.requestId);
    });

    it("blocks untrusted browser origins", async () => {
        const response = await request(app).get("/api/v1").set("Origin", "https://malicious.example");
        assert.equal(response.status, 403);
        assert.equal(response.headers["access-control-allow-origin"], undefined);
    });
});
