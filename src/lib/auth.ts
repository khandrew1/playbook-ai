import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db/index.js";
import * as authSchema from "../db/schema.js";
import {
	betterAuth,
	type OAuth2Tokens,
	type OAuth2UserInfo,
} from "better-auth";
import { genericOAuth, mcp } from "better-auth/plugins";

type YahooUserInfo = {
	sub: string;
	name?: string;
	given_name?: string;
	family_name?: string;
	email?: string | null;
	email_verified?: boolean;
	picture?: string;
};

const fetchUserInfoFromYahoo = async (
	tokens: OAuth2Tokens,
): Promise<YahooUserInfo> => {
	const userInfo = await fetch(
		"https://api.login.yahoo.com/openid/v1/userinfo",
		{
			method: "GET",
			headers: {
				Authorization: `Bearer ${tokens.accessToken}`,
			},
		},
	);

	return (await userInfo.json()) as YahooUserInfo;
};

export const auth = betterAuth({
	database: drizzleAdapter(db, { provider: "pg", schema: authSchema }),
	logger: {
		level: "debug",
	},
	plugins: [
		genericOAuth({
			config: [
				{
					providerId: "yahoo",
					clientId: process.env.YAHOO_CLIENT_ID || "",
					clientSecret: process.env.YAHOO_CLIENT_SECRET || "",
					authorizationUrl: "https://api.login.yahoo.com/oauth2/request_auth",
					tokenUrl: "https://api.login.yahoo.com/oauth2/get_token",
					discoveryUrl:
						"https://api.login.yahoo.com/.well-known/openid-configuration",
					scopes: ["openid", "email", "profile", "fspt-r"],
					accessType: "offline",
					getUserInfo: async (tokens): Promise<OAuth2UserInfo> => {
						const userInfo = await fetchUserInfoFromYahoo(tokens);

						return {
							id: userInfo.sub,
							name: userInfo.name ?? undefined,
							email: userInfo.email ?? undefined,
							emailVerified: userInfo.email_verified ?? false,
						};
					},
				},
			],
		}),
		mcp({
			loginPage: "/sign-in",
		}),
	],
});

export type AuthType = {
	user: typeof auth.$Infer.Session.user | null;
	session: typeof auth.$Infer.Session.session | null;
};
