import { Hono } from "hono";
import type { MiddlewareHandler } from "hono";
import type { AuthType } from "./lib/auth.js";
import withSession from "./middleware/with-session.js";
import routes from "./routes/index.js";

const app = new Hono<{ Variables: AuthType }>({
	strict: false,
});

// Fixed CORS for your domain
const allowedOrigin =
	process.env.ALLOWED_ORIGIN || "https://playbook-ai-rouge.vercel.app";

const corsFixed: MiddlewareHandler = async (c, next) => {
	if (c.req.method === "OPTIONS") {
		return c.newResponse(null, 204, {
			"Access-Control-Allow-Origin": allowedOrigin,
			"Access-Control-Allow-Credentials": "true",
			"Access-Control-Allow-Headers": "Content-Type, Authorization",
			"Access-Control-Allow-Methods": "POST, GET, OPTIONS",
			"Access-Control-Expose-Headers": "Content-Length",
			"Access-Control-Max-Age": "600",
			Vary: "Origin",
		});
	}
	await next();
	c.res.headers.set("Access-Control-Allow-Origin", allowedOrigin);
	c.res.headers.set("Access-Control-Allow-Credentials", "true");
	c.res.headers.set(
		"Access-Control-Allow-Headers",
		"Content-Type, Authorization",
	);
	c.res.headers.set("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
	c.res.headers.set("Access-Control-Expose-Headers", "Content-Length");
	c.res.headers.set("Access-Control-Max-Age", "600");
	c.res.headers.set("Vary", "Origin");
};

app.use("*", corsFixed);

// middleware handler
app.use("*", withSession);

app.route("/", routes);

export default app;
