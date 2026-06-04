import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { summarizeMeeting } from "@/lib/ai.functions";
import { PageShell } from "@/components/PageShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { AiOutput } from "@/components/AiOutput";
import { Loader2, FileText } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/meetings")({
  head: () => ({
    meta: [
      { title: "Meeting Summarizer — Aria" },
      { name: "description", content: "Extract key points, decisions, and action items from meeting notes." },
    ],
  }),
  component: MeetingsPage,
});

function MeetingsPage() {
  const fn = useServerFn(summarizeMeeting);
  const [notes, setNotes] = useState("");
  const mutation = useMutation({
    mutationFn: (input: { notes: string }) => fn({ data: input }),
    onError: (e: Error) => toast.error(e.message || "Failed to summarize"),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (notes.trim().length < 10) {
      toast.error("Paste at least a few sentences of meeting notes.");
      return;
    }
    mutation.mutate({ notes });
  };

  return (
    <PageShell
      title="Meeting Notes Summarizer"
      description="Paste raw notes or a transcript. Aria returns a structured summary with decisions, action items, and deadlines."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Raw notes</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="notes">Paste your notes or transcript</Label>
                <Textarea
                  id="notes"
                  rows={14}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Q3 planning sync — Sarah, Mike, Priya...&#10;- discussed pipeline risk&#10;- Mike to follow up with vendor by Friday..."
                />
              </div>
              <Button type="submit" disabled={mutation.isPending} className="w-full">
                {mutation.isPending ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Summarizing…</>
                ) : (
                  <><FileText className="mr-2 h-4 w-4" /> Summarize Meeting</>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <AiOutput
          text={mutation.data?.text}
          loading={mutation.isPending}
          placeholder="A structured summary will appear here."
        />
      </div>
    </PageShell>
  );
}
