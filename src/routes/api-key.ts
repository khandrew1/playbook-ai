import { Hono } from "hono";
import type { AuthType } from "../lib/auth.js";
import { auth } from "../lib/auth.js";

const apiKeyRouter = new Hono<{ Variables: AuthType }>({ strict: false });

// Creates and returns a new API key for the authenticated user
apiKeyRouter.post("/api-key/create", async (c) => {
	const session = await auth.api
		.getSession({ headers: c.req.raw.headers })
		.catch(() => null);
	const userId = session?.user?.id;

	if (!userId) {
		return c.json({ error: "Unauthorized" }, 401);
	}

	try {
		const result = await auth.api.createApiKey({
			body: {
				name: "dashboard-api-key",
				userId,
			},
			headers: c.req.raw.headers,
		});

		// result includes the `key` (only on creation) and metadata
		return c.json(result);
	} catch (e: any) {
		return c.json({ error: e?.message ?? "Failed to create API key" }, 400);
	}
});

export default apiKeyRouter;
