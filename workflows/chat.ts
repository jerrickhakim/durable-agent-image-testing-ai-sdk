import { convertToModelMessages, type UIMessageChunk, type UIMessage, ModelMessage } from "ai";
import { DurableAgent } from "@workflow/ai/agent";
import { getWritable } from "workflow";
import { fetch } from "workflow";

/**
 * Dead simple chat workflow using DurableAgent with Vercel AI Gateway.
 * Single-turn: processes messages and streams the response.
 */
export async function chat(modelMessages: ModelMessage[]) {
  "use workflow";

  globalThis.fetch = fetch;

  const writable = getWritable<UIMessageChunk>();

  const agent = new DurableAgent({
    model: "gemini/gemini-3-flash",
    system: "You are a helpful assistant.",
  });

  await agent.stream({
    messages: modelMessages,
    writable,
  });
}
