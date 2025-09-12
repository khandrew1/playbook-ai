import { Hono } from "hono";
import type { AuthType } from "../lib/auth.js";
import { auth } from "../lib/auth.js";
import { OAuthAccessToken, withMcpAuth } from "better-auth/plugins";
import { StreamableHTTPTransport } from "@hono/mcp";
import { YahooFantasyClient } from "../lib/yahoo-client.js";
import { createMcpServer } from "../lib/mcp.js";

const mcpRouter = new Hono<{ Variables: AuthType }>({ strict: false });

mcpRouter.all("/mcp", async (c) => {
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

export default mcpRouter;
