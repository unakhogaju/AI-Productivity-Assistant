import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Disclaimer } from "@/components/Disclaimer";
import { Mail, FileText, ListTodo, Search, MessageSquare, ArrowRight, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Aria — AI Workplace Productivity Assistant" },
      {
        name: "description",
        content:
          "Automate email drafting, meeting summaries, task planning, and research with AI.",
      },
    ],
  }),
  component: Dashboard,
});

const tools = [
  {
    to: "/email",
    icon: Mail,
    title: "Smart Email Generator",
    desc: "Draft emails by tone, audience, and intent.",
  },
  {
    to: "/meetings",
    icon: FileText,
    title: "Meeting Summarizer",
    desc: "Turn raw notes into decisions, actions, and deadlines.",
  },
  {
    to: "/planner",
    icon: ListTodo,
    title: "AI Task Planner",
    desc: "Prioritize and schedule your to-do list.",
  },
  {
    to: "/research",
    icon: Search,
    title: "Research Assistant",
    desc: "Structured briefings on any topic.",
  },
  {
    to: "/chat",
    icon: MessageSquare,
    title: "AI Chat",
    desc: "Conversational assistant for anything else.",
  },
] as const;

function Dashboard() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <section className="mb-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground shadow-soft">
          <Sparkles className="h-3 w-3 text-primary" />
          Powered by Lovable AI
        </div>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Get an hour back, every day.
        </h1>
        <p className="mt-2 max-w-2xl text-base text-muted-foreground">
          Aria handles the busywork — emails, notes, plans, research — so you can focus on the
          decisions only you can make.
        </p>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((t) => (
          <Link
            key={t.to}
            to={t.to}
            className="group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl"
          >
            <Card className="h-full transition-all hover:-translate-y-0.5 hover:shadow-elevated">
              <CardHeader>
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <t.icon className="h-5 w-5" />
                </div>
                <CardTitle className="text-base">{t.title}</CardTitle>
                <CardDescription>{t.desc}</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center gap-1 text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                Open <ArrowRight className="h-4 w-4" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </section>

      <div className="mt-10">
        <Disclaimer />
      </div>
    </div>
  );
}
