import { Hono } from "hono";
import { cors } from "hono/cors";
import type { AuthType } from "./lib/auth.js";
import withSession from "./middleware/with-session.js";
import routes from "./routes/index.js";

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

app.route("/", routes);

export default app;
