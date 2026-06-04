import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { researchTopic } from "@/lib/ai.functions";
import { PageShell } from "@/components/PageShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { AiOutput } from "@/components/AiOutput";
import { Loader2, Search } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "AI Research Assistant — Aria" },
      { name: "description", content: "Structured briefings, insights, and summaries on any topic." },
    ],
  }),
  component: ResearchPage,
});

function ResearchPage() {
  const fn = useServerFn(researchTopic);
  const [topic, setTopic] = useState("");
  const [depth, setDepth] = useState<"brief" | "standard" | "deep">("standard");
  const mutation = useMutation({
    mutationFn: (input: { topic: string; depth: typeof depth }) => fn({ data: input }),
    onError: (e: Error) => toast.error(e.message || "Failed to research"),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim().length < 3) {
      toast.error("Enter a topic to research.");
      return;
    }
    mutation.mutate({ topic, depth });
  };

  return (
    <PageShell
      title="AI Research Assistant"
      description="Get a structured briefing — executive summary, insights, players, risks, and next questions."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Topic</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="topic">What should Aria research?</Label>
                <Input
                  id="topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. The current state of AI agents in customer support"
                />
              </div>
              <div className="space-y-2">
                <Label>Depth</Label>
                <Select value={depth} onValueChange={(v) => setDepth(v as typeof depth)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="brief">Brief (skim)</SelectItem>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="deep">Deep dive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" disabled={mutation.isPending} className="w-full">
                {mutation.isPending ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Researching…</>
                ) : (
                  <><Search className="mr-2 h-4 w-4" /> Research Topic</>
                )}
              </Button>
              <p className="text-xs text-muted-foreground">
                Aria draws on general knowledge and has no live web access. Verify time-sensitive
                claims.
              </p>
            </form>
          </CardContent>
        </Card>

        <AiOutput
          text={mutation.data?.text}
          loading={mutation.isPending}
          placeholder="Your briefing will appear here."
        />
      </div>
    </PageShell>
  );
}
