# StyleCart Fashion — Environment Configuration

| Variable | Description | Default | Required in Production |
|---|---|---|---|
| `PORT` | HTTP Server Port | `5001` | No |
| `NODE_ENV` | Environment (`development`/`production`) | `development` | Yes |
| `JWT_SECRET` | Secret key used to sign JWT tokens | `DEV_ONLY_STYLECART_SECRET` | **YES** |
| `JWT_EXPIRES_IN` | Token expiration duration | `7d` | No |
| `GEMINI_API_KEY` | Google Gemini 1.5 API Key | `null` (Fallback Mode) | Optional |
| `MONGODB_URI` | MongoDB Connection String | `mongodb://127.0.0.1:27017/stylecart` | No (Hybrid Fallback) |
| `CORS_ORIGINS` | Comma-separated allowed origins | `http://localhost:5001,http://localhost:3000` | Recommended |
