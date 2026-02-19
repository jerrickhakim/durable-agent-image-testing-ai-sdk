import { createUIMessageStreamResponse } from "ai";
import { getRun } from "workflow/api";

/**
 * GET /api/chat/[id]/stream
 * Reconnects to an existing workflow stream for resumption after interruption.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(_req.url);

  const startIndexParam = searchParams.get("startIndex");
  const startIndex = startIndexParam
    ? parseInt(startIndexParam, 10)
    : undefined;

  const run = getRun(id);
  const stream = run.getReadable({ startIndex });

  return createUIMessageStreamResponse({ stream });
}
