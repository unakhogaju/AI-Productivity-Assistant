import { createFileRoute, useParams } from "@tanstack/react-router";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useMemo, useRef } from "react";
import { getThread, useThreads, newThread } from "@/lib/chat-threads";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputSubmit,
  PromptInputFooter,
  type PromptInputMessage,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { Disclaimer } from "@/components/Disclaimer";
import { toast } from "sonner";

export const Route = createFileRoute("/chat/$threadId")({
  component: ChatThread,
});

function ChatThread() {
  const { threadId } = useParams({ from: "/chat/$threadId" });
  const { upsert } = useThreads();

  const initial = useMemo(() => getThread(threadId), [threadId]);
  const initialMessages = initial?.messages ?? [];

  const transport = useMemo(() => new DefaultChatTransport({ api: "/api/chat" }), []);

  const { messages, sendMessage, status, error } = useChat({
    id: threadId,
    messages: initialMessages,
    transport,
    onError: (e) => toast.error(e.message || "Chat error"),
  });

  const lastPersistedRef = useRef<string>("");
  useEffect(() => {
    if (status === "streaming" || status === "submitted") return;
    if (messages.length === 0) return;
    const sig = String(messages.length) + ":" + (messages[messages.length - 1]?.id ?? "");
    if (sig === lastPersistedRef.current) return;
    lastPersistedRef.current = sig;

    const existing = getThread(threadId) ?? { ...newThread(), id: threadId };
    const firstUser = messages.find((m) => m.role === "user");
    const title = firstUser
      ? extractText(firstUser).slice(0, 60) || "New chat"
      : existing.title || "New chat";

    upsert({
      ...existing,
      id: threadId,
      title,
      updatedAt: Date.now(),
      messages: messages as UIMessage[],
    });
  }, [messages, status, threadId, upsert]);

  useEffect(() => {
    if (error) toast.error(error.message || "Something went wrong");
  }, [error]);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    inputRef.current?.focus();
  }, [threadId, status]);

  const handleSubmit = (message: PromptInputMessage) => {
    const text = message.text?.trim();
    if (!text) return;
    sendMessage({ text });
  };

  const isLoading = status === "submitted" || status === "streaming";

  return (
    <div className="flex h-full flex-col">
      <Conversation className="flex-1">
        <ConversationContent className="mx-auto w-full max-w-3xl px-4 py-6">
          {messages.length === 0 && (
            <div className="py-16 text-center">
              <h2 className="text-lg font-semibold text-foreground">How can I help?</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Ask anything about emails, meetings, planning, or research.
              </p>
            </div>
          )}
          {messages.map((m) => {
            const text = extractText(m);
            if (m.role === "user") {
              return (
                <Message key={m.id} from="user">
                  <MessageContent>{text}</MessageContent>
                </Message>
              );
            }
            return (
              <Message key={m.id} from="assistant">
                <MessageContent>
                  {text ? (
                    <MessageResponse>{text}</MessageResponse>
                  ) : (
                    <Shimmer>Thinking…</Shimmer>
                  )}
                </MessageContent>
              </Message>
            );
          })}
          {status === "submitted" && (
            <Message from="assistant">
              <MessageContent>
                <Shimmer>Thinking…</Shimmer>
              </MessageContent>
            </Message>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <div className="border-t border-border bg-background">
        <div className="mx-auto w-full max-w-3xl space-y-2 px-4 py-3">
          <PromptInput onSubmit={handleSubmit}>
            <PromptInputTextarea ref={inputRef} placeholder="Message Aria…" />
            <PromptInputFooter className="justify-end">
              <PromptInputSubmit status={status} disabled={isLoading} />
            </PromptInputFooter>
          </PromptInput>
          <Disclaimer />
        </div>
      </div>
    </div>
  );
}

function extractText(m: UIMessage): string {
  return m.parts
    .map((p) => (p.type === "text" ? p.text : ""))
    .join("");
}
