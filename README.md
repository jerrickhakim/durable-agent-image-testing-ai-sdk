# Durable Agent Image URL Test

Test of sending images to AI models via durable agents.

**Image URLs directly** → `AI_DownloadError: Failed to download ... Error: Not supported in workflow functions` (workflow runtime blocks network fetches)

**Base64 workaround** → fetch requests get stuck on pending

**Tool-loop agent works** → Use [http://localhost:3000/tool-agent](http://localhost:3000/tool-agent) (non-durable, no workflow; image URLs work)

## Setup

```bash
cp .env.example .env
```

For testing: `AI_GATEWAY_API_KEY=your_ai_gateway_api_key`

## Run

```bash
bun run dev
```
