import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const server = new McpServer({
	name: "Yahoo Fantasy MCP Server",
	version: "0.1.0",
});

server.registerTool(
	"add",
	{
		title: "Addition Tool",
		description: "Add two numbers",
		inputSchema: { a: z.number(), b: z.number() },
	},
	async ({ a, b }) => ({
		content: [{ type: "text", text: String(a + b) }],
	}),
);

export default server;
