import { StreamableHTTPTransport } from "@hono/mcp";
import {
	OAuthAccessToken,
	oAuthDiscoveryMetadata,
	oAuthProtectedResourceMetadata,
	withMcpAuth,
} from "better-auth/plugins";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { z } from "zod";
import type { AuthType } from "./lib/auth";
import { auth } from "./lib/auth";
import { YahooFantasyClient } from "./lib/yahoo-client";
import { createMcpServer } from "./lib/mcp";
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

// handles auth if MCP client gets confused
app.get("/.well-known/oauth-authorization-server", async (c) => {
	const handler = oAuthDiscoveryMetadata(auth);
	return handler(c.req.raw);
});

app.get("/.well-known/oauth-protected-resource", async (c) => {
	const handler = oAuthProtectedResourceMetadata(auth);
	return handler(c.req.raw);
});

// mcp server
app.all("/mcp", async (c) => {
	const handler = withMcpAuth(
		auth,
		async (_req: Request, session: OAuthAccessToken) => {
			const userId = (session as any)?.userId || c.get("user")?.id || "";
			const yahoo = new YahooFantasyClient(auth, userId);
			const server = createMcpServer(yahoo);

			const transport = new StreamableHTTPTransport();
			await server.connect(transport);
			return (await transport.handleRequest(c))!;
		},
	);

	return handler(c.req.raw);
});

export default app;
