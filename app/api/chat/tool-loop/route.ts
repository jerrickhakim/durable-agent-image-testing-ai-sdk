import { ToolLoopAgent, UIMessage, createAgentUIStreamResponse, gateway } from "ai";

const agent = new ToolLoopAgent({
  model: "google/gemini-3-flash",
  instructions: "You are a helpful assistant.",
  tools: {},
});

/**
 * POST /api/chat/tool-loop
 * Chat endpoint using ToolLoopAgent (non-durable). For testing image handling.
 */
export async function POST(req: Request) {
  // const { messages } = await req.json();

  const testMessages: UIMessage[] = [
    {
      parts: [
        {
          type: "file",
          mediaType: "image/png",
          url: "https://repogo.app/icon.png",
          filename: "icon.png",
        },
        {
          type: "text",
          text: "What's on this image",
        },
      ],
      id: "SgFQaVOEYD2d8VXZ",
      role: "user",
    },
  ];

  return createAgentUIStreamResponse({
    agent,
    uiMessages: testMessages,
  });
}
