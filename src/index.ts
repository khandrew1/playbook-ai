import { Hono } from "hono";
import { cors } from "hono/cors";
import type { AuthType } from "./lib/auth";
import { auth } from "./lib/auth";
import withSession from "./middleware/with-session";
import authRouter from "./routes/auth";

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

app.route("/", authRouter);

export default app;
