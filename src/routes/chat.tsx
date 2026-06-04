import { createFileRoute, Link, Outlet, useNavigate, useParams, useRouterState } from "@tanstack/react-router";
import { useThreads, newThread } from "@/lib/chat-threads";
import { Button } from "@/components/ui/button";
import { MessageSquarePlus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "AI Chat — Aria" },
      { name: "description", content: "Conversational AI assistant for work tasks." },
    ],
  }),
  component: ChatLayout,
});

function ChatLayout() {
  const { threads, upsert, remove } = useThreads();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const params = useParams({ strict: false }) as { threadId?: string };
  const activeId = params.threadId;

  const handleNew = () => {
    const t = newThread();
    upsert(t);
    navigate({ to: "/chat/$threadId", params: { threadId: t.id } });
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    remove(id);
    if (activeId === id) {
      navigate({ to: "/chat" });
    }
  };

  return (
    <div className="flex h-[calc(100vh-3rem)] w-full">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-card/40 md:flex">
        <div className="p-3">
          <Button onClick={handleNew} className="w-full" size="sm">
            <MessageSquarePlus className="mr-2 h-4 w-4" /> New chat
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto px-2 pb-3">
          {threads.length === 0 ? (
            <p className="px-2 py-4 text-xs text-muted-foreground">
              No conversations yet. Start a new chat.
            </p>
          ) : (
            <ul className="space-y-0.5">
              {threads.map((t) => {
                const active = t.id === activeId;
                return (
                  <li key={t.id}>
                    <div
                      className={cn(
                        "group flex items-center gap-1 rounded-md px-2 py-1.5 text-sm transition-colors",
                        active ? "bg-accent text-accent-foreground" : "hover:bg-accent/60",
                      )}
                    >
                      <Link
                        to="/chat/$threadId"
                        params={{ threadId: t.id }}
                        className="flex-1 truncate"
                        title={t.title}
                      >
                        {t.title || "Untitled chat"}
                      </Link>
                      <button
                        type="button"
                        onClick={(e) => handleDelete(e, t.id)}
                        className="rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                        aria-label="Delete chat"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        {pathname === "/chat" ? <ChatEmptyState onNew={handleNew} /> : <Outlet />}
      </div>
    </div>
  );
}

function ChatEmptyState({ onNew }: { onNew: () => void }) {
  return (
    <div className="flex flex-1 items-center justify-center p-8">
      <div className="max-w-md text-center">
        <h2 className="text-xl font-semibold text-foreground">Start a conversation</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Ask Aria to draft, summarize, plan, or brainstorm anything related to your work.
        </p>
        <Button onClick={onNew} className="mt-5">
          <MessageSquarePlus className="mr-2 h-4 w-4" /> New chat
        </Button>
      </div>
    </div>
  );
}
