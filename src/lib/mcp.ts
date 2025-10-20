import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { YahooFantasyClient } from "./yahoo-client.js";

export const createMcpServer = (yahoo: YahooFantasyClient) => {
	const server = new McpServer({
		name: "Yahoo Fantasy MCP Server",
		version: "0.1.0",
	});

	server.registerTool(
		"league.get",
		{
			title: "Get Yahoo League",
			description: "Fetch a league by leagueKey.",
			inputSchema: { leagueKey: z.string() },
		},
		async ({ leagueKey }) => {
			const data = await yahoo.getLeague(leagueKey);
			const structuredContent = JSON.parse(data);
			return {
				content: [
					{ type: "text", text: JSON.stringify(structuredContent, null, 2) },
				],
				structuredContent,
			};
		},
	);

	server.registerTool(
		"games.list",
		{
			title: "List NFL Games",
			description:
				"Fetch NFL games for a season (defaults to 2025) in JSON format.",
			inputSchema: { season: z.string().optional() },
		},
		async ({ season }) => {
			const s = season || "2025";
			const data = await yahoo.getGamesNFL(s);
			const structuredContent = JSON.parse(data);
			return {
				content: [
					{ type: "text", text: JSON.stringify(structuredContent, null, 2) },
				],
				structuredContent,
			};
		},
	);

	return server;
};
