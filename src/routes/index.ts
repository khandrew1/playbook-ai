import { Hono } from "hono";
import type { AuthType } from "../lib/auth.js";
import authRouter from "./auth.js";
import mcpRouter from "./mcp.js";
import apiKeyRouter from "./api-key.js";

// Group all app routes here and mount in src/index.ts
const routes = new Hono<{ Variables: AuthType }>({ strict: false });

routes.route("/", authRouter);
routes.route("/", mcpRouter);
routes.route("/", apiKeyRouter);

export default routes;
