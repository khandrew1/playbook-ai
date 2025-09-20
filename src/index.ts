import { Hono } from "hono";
import { cors } from "hono/cors";
import type { AuthType } from "./lib/auth.js";
import { auth } from "./lib/auth.js";
import withSession from "./middleware/with-session.js";
import routes from "./routes/index.js";
import {
	oAuthDiscoveryMetadata,
	oAuthProtectedResourceMetadata,
} from "better-auth/plugins";

const app = new Hono<{ Variables: AuthType }>({
	strict: false,
});

app.use(
	"*",
	cors({
		origin: "*",
		allowHeaders: ["Content-Type", "Authorization"],
		allowMethods: ["POST", "GET", "OPTIONS"],
		exposeHeaders: ["Content-Length"],
		maxAge: 600,
		credentials: true,
	}),
);

// middleware handler
app.use("*", withSession);

app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));

app.get("/.well-known/oauth-authorization-server", async (c) => {
	const handler = oAuthDiscoveryMetadata(auth);
	return handler(c.req.raw);
});

app.get("/.well-known/oauth-protected-resource", async (c) => {
	const handler = oAuthProtectedResourceMetadata(auth);
	return handler(c.req.raw);
});

app.route("/", routes);

export default app;
