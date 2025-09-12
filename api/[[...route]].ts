// Vercel Edge entry that forwards all routes to the Hono app
export const config = { runtime: "edge" };

import app from "../src/index";

export default app;
