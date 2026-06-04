import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { planTasks } from "@/lib/ai.functions";
import { PageShell } from "@/components/PageShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { AiOutput } from "@/components/AiOutput";
import { Loader2, ListTodo } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/planner")({
  head: () => ({
    meta: [
      { title: "AI Task Planner — Aria" },
      { name: "description", content: "Prioritize and schedule your tasks using the Eisenhower matrix." },
    ],
  }),
  component: PlannerPage,
});

function PlannerPage() {
  const fn = useServerFn(planTasks);
  const [tasks, setTasks] = useState("");
  const [horizon, setHorizon] = useState<"today" | "this-week" | "this-month">("today");
  const mutation = useMutation({
    mutationFn: (input: { tasks: string; horizon: typeof horizon }) => fn({ data: input }),
    onError: (e: Error) => toast.error(e.message || "Failed to plan"),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tasks.trim().length < 5) {
      toast.error("List a few tasks first.");
      return;
    }
    mutation.mutate({ tasks, horizon });
  };

  return (
    <PageShell
      title="AI Task Planner"
      description="Dump your tasks. Aria sorts them by priority and time-blocks your schedule."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Your tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-2">
                <Label>Planning horizon</Label>
                <Select value={horizon} onValueChange={(v) => setHorizon(v as typeof horizon)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="this-week">This week</SelectItem>
                    <SelectItem value="this-month">This month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tasks">Tasks (one per line, free-form)</Label>
                <Textarea
                  id="tasks"
                  rows={12}
                  value={tasks}
                  onChange={(e) => setTasks(e.target.value)}
                  placeholder={`Finish Q3 deck for board\nReview Mike's PR\nReply to vendor about renewal\n1:1 prep for tomorrow`}
                />
              </div>
              <Button type="submit" disabled={mutation.isPending} className="w-full">
                {mutation.isPending ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Planning…</>
                ) : (
                  <><ListTodo className="mr-2 h-4 w-4" /> Generate Plan</>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <AiOutput
          text={mutation.data?.text}
          loading={mutation.isPending}
          placeholder="Your prioritized plan will appear here."
        />
      </div>
    </PageShell>
  );
}
