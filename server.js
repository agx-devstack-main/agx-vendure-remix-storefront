import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import { createRequestHandler } from "@remix-run/express";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(express.static("public", { maxAge: "1h" }));

// Handle all requests with Remix
const mode = process.env.NODE_ENV || "production";
const build = mode === "production" 
  ? await import("./build/index.js")
  : null;

if (mode === "production" && !build) {
  console.error("Build file not found. Run 'npm run build' first.");
  process.exit(1);
}

const remixHandler = createRequestHandler({
  build: mode === "production" ? build : async () => {
    const buildModule = await import(`./build/index.js?t=${Date.now()}`);
    return buildModule;
  },
});

app.all("*", remixHandler);

// Start server
app.listen(PORT, () => {
  console.log(`✓ Server ready: http://localhost:${PORT}`);
  console.log(`✓ Environment: ${mode}`);
});
