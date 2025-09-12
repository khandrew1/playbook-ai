import { Hono } from "hono";
import { html } from "hono/html";
import type { AuthType } from "../lib/auth.js";
import { auth } from "../lib/auth.js";

const authRouter = new Hono<{ Variables: AuthType }>({
	strict: false,
});

// Auth API passthrough

authRouter.get("/sign-in", async (c) => {
	const authUrlResult = await auth.api.signInWithOAuth2({
		body: {
			providerId: "yahoo",
			callbackURL: "/dashboard",
			errorCallbackURL: "/dashboard",
		},
		request: c.req.raw,
	});

	const oauthUrl = authUrlResult.url;

	return c.html(html`
        <html lang="en">
            <body>
                <div>
                    <h1>Sign in</h1>
                    <p>Please sign in to authorize the application.</p>
                    <a href="${oauthUrl}" class="button">Sign in with Yahoo</a>
                </div>
            </body>
        </html>
    `);
});

authRouter.get("/sign-out", async (c) => {
	await auth.api.signOut({
		headers: c.req.raw.headers,
	});
	return c.text("Signed Out");
});

authRouter.get("/dashboard", async (c) => {
	const session = await auth.api.getSession({ headers: c.req.raw.headers });
	const isLoggedIn = Boolean(session?.session);

	return c.html(html`
        <html lang="en">
            <body>
                <div>
                    <h1>Dashboard</h1>
                    <p>Auth status: ${isLoggedIn ? "User is logged in" : "User is not logged in"}</p>
                    <div>
                        ${
													isLoggedIn
														? html`<a href="/sign-out">Sign out</a>`
														: html`<a href="/sign-in">Sign in with Yahoo</a>`
												}
                    </div>
                </div>
            </body>
        </html>
    `);
});

export default authRouter;
