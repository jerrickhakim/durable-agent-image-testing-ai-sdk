# Durable Agent Image URL Test

Test of sending images to AI models via durable agents.

**Image URLs directly** → `AI_DownloadError: Failed to download ... Error: Not supported in workflow functions` (workflow runtime blocks network fetches)

**Base64 workaround** → fetch requests get stuck on pending

**Tool-loop agent works** → Use [http://localhost:3000/tool-agent](http://localhost:3000/tool-agent) (non-durable, no workflow; image URLs work)

### Solution: `experimental_download: workflowDownload`

The default AI SDK download uses `fetch`, which throws "Not supported in workflow functions" in the workflow runtime. Use a custom download that returns `null` for each URL so the model receives the URL directly—models that support image URLs (e.g. Claude, GPT-4V) will fetch them.

```ts
import { DurableAgent, type DownloadFunction } from "@workflow/ai/agent";

const workflowDownload: DownloadFunction = async (requestedDownloads) =>
  requestedDownloads.map(() => null);

await agent.stream({
  messages: modelMessages,
  writable,
  experimental_download: workflowDownload,
});
```

## Setup

```bash
cp .env.example .env
```

For testing: `AI_GATEWAY_API_KEY=your_ai_gateway_api_key`

## Run

```bash
bun run dev
```
