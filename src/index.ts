import { Hono } from "hono";
import { cors } from "hono/cors";
import type { AuthType } from "./lib/auth";
import withSession from "./middleware/with-session";
import routes from "./routes";

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
