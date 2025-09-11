type BetterAuthAPI = {
	api: {
		getAccessToken: (args: {
			body: { providerId: string; accountId?: string; userId?: string };
			headers?: HeadersInit;
		}) => Promise<{ accessToken: string }>;
	};
};

export class YahooFantasyClient {
	constructor(
		private readonly auth: BetterAuthAPI,
		private readonly userId: string,
		private readonly base = "https://fantasysports.yahooapis.com/fantasy/v2",
	) {}

	private async getYahooAuthHeaders(): Promise<{ Authorization: string }> {
		const { accessToken } = await this.auth.api.getAccessToken({
			body: { providerId: "yahoo", userId: this.userId },
		});
		console.log("ACCESS TOKEN: ", accessToken);
		return { Authorization: `Bearer ${accessToken}` };
	}

	private async yfFetch(path: string, init: RequestInit = {}) {
		const headers = await this.getYahooAuthHeaders();
		const res = await fetch(`${this.base}${path}`, {
			...init,
			headers: { ...(init.headers || {}), ...headers },
		});

		return res;
	}

	async getLeague(leagueKey: string) {
		const res = await this.yfFetch(
			`/league/${encodeURIComponent(leagueKey)}?format=json`,
		);
		if (!res.ok) throw new Error(`Yahoo error ${res.status}`);
		return res.text();
	}

	async getGamesNFL(season: string = "2025") {
		const res = await this.yfFetch(
			`/games;game_codes=nfl;seasons=${encodeURIComponent(season)}?format=json`,
		);
		if (!res.ok) throw new Error(`Yahoo error ${res.status}`);
		return res.text();
	}
}
