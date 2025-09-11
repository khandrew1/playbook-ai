import { Hono } from "hono";
import type { AuthType } from "../lib/auth";
import authRouter from "./auth";
import mcpRouter from "./mcp";

// Group all app routes here and mount in src/index.ts
const routes = new Hono<{ Variables: AuthType }>({ strict: false });

routes.route("/", authRouter);
routes.route("/", mcpRouter);

export default routes;
