import { Hono } from "hono";
import type { MiddlewareHandler } from "hono";
import type { AuthType } from "./lib/auth";
import withSession from "./middleware/with-session";
import routes from "./routes";

const app = new Hono<{ Variables: AuthType }>({
	strict: false,
});

// Dynamic CORS: echo request Origin to support credentials before you have a fixed domain
const dynamicCors: MiddlewareHandler = async (c, next) => {
	if (c.req.method === "OPTIONS") {
		const origin = c.req.header("Origin") ?? "*";
		return c.newResponse(null, 204, {
			"Access-Control-Allow-Origin": origin,
			"Access-Control-Allow-Credentials": "true",
			"Access-Control-Allow-Headers": "Content-Type, Authorization",
			"Access-Control-Allow-Methods": "POST, GET, OPTIONS",
			"Access-Control-Expose-Headers": "Content-Length",
			"Access-Control-Max-Age": "600",
			Vary: "Origin",
		});
	}
	await next();
	const origin = c.req.header("Origin") ?? "*";
	c.res.headers.set("Access-Control-Allow-Origin", origin);
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

app.use("*", dynamicCors);

// middleware handler
app.use("*", withSession);

app.route("/", routes);

export default app;
