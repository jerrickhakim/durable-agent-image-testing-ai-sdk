"use client";

import { useChat } from "@ai-sdk/react";
import { WorkflowChatTransport } from "@workflow/ai";
import { useMemo, useState } from "react";

export default function Chat() {
  const [input, setInput] = useState("");

  const activeWorkflowRunId = useMemo(() => {
    if (typeof window === "undefined") return undefined;
    return localStorage.getItem("active-workflow-run-id") ?? undefined;
  }, []);

  const { messages, sendMessage, status } = useChat({
    resume: !!activeWorkflowRunId,
    transport: new WorkflowChatTransport({
      api: "/api/chat",
      onChatSendMessage: (response) => {
        const workflowRunId = response.headers.get("x-workflow-run-id");
        if (workflowRunId) {
          localStorage.setItem("active-workflow-run-id", workflowRunId);
        }
      },
      onChatEnd: () => {
        localStorage.removeItem("active-workflow-run-id");
      },
      prepareReconnectToStreamRequest: ({ api, ...rest }) => {
        const runId = localStorage.getItem("active-workflow-run-id");
        if (!runId) throw new Error("No active workflow run ID found");
        return {
          ...rest,
          api: `/api/chat/${encodeURIComponent(runId)}/stream`,
        };
      },
    }),
  });

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950">
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 p-6">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          Chat
        </h1>

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${
                m.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[85%] rounded-lg px-4 py-2 ${
                  m.role === "user"
                    ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                    : "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
                }`}
              >
                <div className="flex flex-col gap-1">
                  {m.parts.map((part, i) => {
                    if (part.type === "text") {
                      return (
                        <span key={i} className="whitespace-pre-wrap">
                          {part.text}
                        </span>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!input.trim()) return;
            sendMessage({ text: input });
            setInput("");
          }}
          className="flex gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Say something..."
            disabled={status === "streaming"}
            className="flex-1 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-zinc-900 placeholder-zinc-500 focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder-zinc-400"
          />
          <button
            type="submit"
            disabled={status === "streaming" || !input.trim()}
            className="rounded-lg bg-zinc-900 px-4 py-2 font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {status === "streaming" ? "..." : "Send"}
          </button>
        </form>
      </main>
    </div>
  );
}
