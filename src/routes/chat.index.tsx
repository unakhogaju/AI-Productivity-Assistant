import { createFileRoute } from "@tanstack/react-router";

// The /chat layout renders the empty-state when no thread is selected.
export const Route = createFileRoute("/chat/")({
  component: () => null,
});
