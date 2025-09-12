import { Hono } from "hono";
import type { AuthType } from "../lib/auth.js";
import { auth } from "../lib/auth.js";
import { OAuthAccessToken, withMcpAuth } from "better-auth/plugins";
import { StreamableHTTPTransport } from "@hono/mcp";
import { YahooFantasyClient } from "../lib/yahoo-client.js";
import { createMcpServer } from "../lib/mcp.js";

const mcpRouter = new Hono<{ Variables: AuthType }>({ strict: false });

mcpRouter.all("/mcp", async (c) => {
	// Prefer MCP OAuth (withMcpAuth). If unauthorized, fallback to API key session.
	const handler = withMcpAuth(
		auth,
		async (_req: Request, session: OAuthAccessToken) => {
			const userId = (session as any)?.userId || c.get("user")?.id || "";
			console.log("userID: ", userId);
			const yahoo = new YahooFantasyClient(auth, userId);
			const server = createMcpServer(yahoo);

			const transport = new StreamableHTTPTransport();
			await server.connect(transport);
			return (await transport.handleRequest(c))!;
		},
	);

	const oauthResp = await handler(c.req.raw);
	if (oauthResp.status !== 401) return oauthResp;

	// Fallback: allow API Key authenticated access
	const apiKeySession = await auth.api
		.getSession({ headers: c.req.raw.headers })
		.catch(() => null);
	const userId = apiKeySession?.user?.id;
	if (!userId) return oauthResp; // keep original 401 with auth hints

	const yahoo = new YahooFantasyClient(auth, userId);
	const server = createMcpServer(yahoo);
	const transport = new StreamableHTTPTransport();
	await server.connect(transport);
	return transport.handleRequest(c);
});

export default mcpRouter;
