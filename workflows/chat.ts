import { convertToModelMessages, type UIMessageChunk, type UIMessage, ModelMessage } from "ai";
import { DurableAgent, type DownloadFunction } from "@workflow/ai/agent";
import { getWritable } from "workflow";
import { fetch } from "workflow";

/**
 * Custom download for workflow context. The default AI SDK download uses fetch,
 * which throws "Not supported in workflow functions" in the workflow runtime.
 * We pass URLs through to the model (return null for each) so the model receives
 * the URL directly. Models that support image URLs (e.g. Claude, GPT-4V) will fetch them.
 */
const workflowDownload: DownloadFunction = async (requestedDownloads) => requestedDownloads.map(() => null);

/**
 * Dead simple chat workflow using DurableAgent with Vercel AI Gateway.
 * Single-turn: processes messages and streams the response.
 */
export async function chat(modelMessages: ModelMessage[]) {
  "use workflow";

  globalThis.fetch = fetch;

  const writable = getWritable<UIMessageChunk>();

  const agent = new DurableAgent({
    model: "google/gemini-3-flash",
    system: "You are a helpful assistant.",
  });

  await agent.stream({
    messages: modelMessages,
    writable,
    experimental_download: workflowDownload,
  });
}
