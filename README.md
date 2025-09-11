To install dependencies:
```sh
bun install
```

To run (HTTPS required for Yahoo OAuth):
```sh
TLS_CERT=cert/localhost.pem TLS_KEY=cert/localhost-key.pem bun run dev
```

Generate local TLS certs:
- mkcert (recommended):
  - `mkcert -install`
  - `mkcert -key-file cert/localhost-key.pem -cert-file cert/localhost.pem localhost`
- Or OpenSSL:
  - `mkdir -p cert`
  - `openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
     -keyout cert/localhost-key.pem -out cert/localhost.pem \
     -subj "/C=US/ST=Local/L=Local/O=Dev/OU=Dev/CN=localhost"`

Then open:
```
https://localhost:3000
```

Yahoo callback URL (set in Yahoo app):
```
https://localhost:3000/api/auth/oauth2/callback/yahoo
```
