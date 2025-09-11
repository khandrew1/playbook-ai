import app from "./index";

const port = Number(process.env.PORT ?? 3000);

// Read TLS cert/key from env paths; fail if missing when HTTPS requested
const tlsCertPath = process.env.TLS_CERT || process.env.SSL_CERT_FILE || "";
const tlsKeyPath = process.env.TLS_KEY || process.env.SSL_KEY_FILE || "";

if (!tlsCertPath || !tlsKeyPath) {
	console.error(
		"TLS_CERT and TLS_KEY env vars are required to run HTTPS locally (Yahoo requires https).",
	);
	console.error(
		"Set TLS_CERT and TLS_KEY to your local certificate and key paths. See README for instructions.",
	);
	process.exit(1);
}

const server = Bun.serve({
	port,
	tls: {
		cert: Bun.file(tlsCertPath),
		key: Bun.file(tlsKeyPath),
	},
	fetch: app.fetch,
});

console.log(`HTTPS listening on https://localhost:${server.port}`);
