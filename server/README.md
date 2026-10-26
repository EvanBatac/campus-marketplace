# Server configuration

Set `CLIENT_ORIGINS` in `server/.env` or in your deployment environment to the
frontend origins allowed by Socket.IO. Use comma-separated origins, including
the protocol and port where applicable, without paths or trailing slashes:

```dotenv
CLIENT_ORIGINS=https://marketplace.example.com,https://preview.example.com
```

If unset, Socket.IO allows `http://localhost:5173` for local development. To allow
both a deployed frontend and local development, include both origins explicitly.
Restart the server after changing this setting.
