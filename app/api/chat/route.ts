import { Buffer } from "buffer";
import { convertToModelMessages, createUIMessageStreamResponse, type UIMessage } from "ai";
import { start } from "workflow/api";
import { chat } from "@/workflows/chat";
import fs from "fs";

type FilePart = {
  type: "file";
  mediaType: string;
  url: string;
  filename?: string;
};

function isFilePart(part: unknown): part is FilePart {
  return (
    typeof part === "object" &&
    part !== null &&
    "type" in part &&
    (part as { type: string }).type === "file" &&
    "url" in part &&
    typeof (part as { url: string }).url === "string"
  );
}

function isHttpUrl(url: string): boolean {
  return url.startsWith("http://") || url.startsWith("https://");
}

async function transformFilePartToBase64(filePart: FilePart): Promise<{ type: "file"; filename: string; mediaType: string; url: string }> {
  const response = await fetch(filePart.url);
  const arrayBuffer = await response.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");
  const mediaType = filePart.mediaType || "image/png";
  const filename = filePart.filename || "image.png";

  return {
    type: "file",
    filename,
    mediaType,
    url: `data:${mediaType};base64,${base64}`,
  };
}

async function transformMessagesToBase64(messages: UIMessage[]): Promise<UIMessage[]> {
  return Promise.all(
    messages.map(async (message) => ({
      ...message,
      parts: await Promise.all(
        (message.parts ?? []).map(async (part) => {
          if (isFilePart(part) && isHttpUrl(part.url)) {
            return transformFilePartToBase64(part);
          }
          return part;
        }),
      ),
    })),
  );
}

/**
 * POST /api/chat
 * Starts a new chat session. Returns stream with x-workflow-run-id for resumption.
 */
export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

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

  // const messagesWithBase64 = await transformMessagesToBase64(testMessages);
  // console.log(JSON.stringify(messagesWithBase64, null, 2));
  // fs.writeFileSync("messagesWithBase64.json", JSON.stringify(messagesWithBase64, null, 2));

  const modelMessages = await convertToModelMessages(testMessages);

  fs.writeFileSync("modelMessages.json", JSON.stringify(modelMessages, null, 2));

  const run = await start(chat, [modelMessages]);

  return createUIMessageStreamResponse({
    stream: run.readable,
    headers: {
      "x-workflow-run-id": run.runId,
    },
  });
}
