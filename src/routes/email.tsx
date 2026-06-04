import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { generateEmail } from "@/lib/ai.functions";
import { PageShell } from "@/components/PageShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AiOutput } from "@/components/AiOutput";
import { Loader2, Wand2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/email")({
  head: () => ({
    meta: [
      { title: "Smart Email Generator — Aria" },
      { name: "description", content: "Generate professional emails tailored by tone and audience." },
    ],
  }),
  component: EmailPage,
});

function EmailPage() {
  const fn = useServerFn(generateEmail);
  const [recipient, setRecipient] = useState("");
  const [purpose, setPurpose] = useState("");
  const [tone, setTone] = useState<"professional" | "friendly" | "persuasive" | "concise" | "formal" | "apologetic">("professional");
  const [audience, setAudience] = useState<"client" | "colleague" | "executive" | "vendor" | "team" | "candidate">("client");

  const mutation = useMutation({
    mutationFn: (input: { recipient: string; purpose: string; tone: typeof tone; audience: typeof audience }) =>
      fn({ data: input }),
    onError: (e: Error) => toast.error(e.message || "Failed to generate email"),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient.trim() || !purpose.trim()) {
      toast.error("Fill in recipient and purpose first.");
      return;
    }
    mutation.mutate({ recipient, purpose, tone, audience });
  };

  return (
    <PageShell
      title="Smart Email Generator"
      description="Describe the email and Aria will draft it in your chosen tone."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Brief</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="recipient">Recipient</Label>
                <Input
                  id="recipient"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="e.g. Sarah at Acme Corp"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Audience</Label>
                  <Select value={audience} onValueChange={(v) => setAudience(v as typeof audience)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="client">Client</SelectItem>
                      <SelectItem value="colleague">Colleague</SelectItem>
                      <SelectItem value="executive">Executive</SelectItem>
                      <SelectItem value="vendor">Vendor</SelectItem>
                      <SelectItem value="team">Team</SelectItem>
                      <SelectItem value="candidate">Candidate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tone</Label>
                  <Select value={tone} onValueChange={(v) => setTone(v as typeof tone)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="friendly">Friendly</SelectItem>
                      <SelectItem value="persuasive">Persuasive</SelectItem>
                      <SelectItem value="concise">Concise</SelectItem>
                      <SelectItem value="formal">Formal</SelectItem>
                      <SelectItem value="apologetic">Apologetic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="purpose">Purpose / key points</Label>
                <Textarea
                  id="purpose"
                  rows={7}
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="Follow up on yesterday's demo. Propose pilot for Q3. Mention pricing flexibility."
                />
              </div>
              <Button type="submit" disabled={mutation.isPending} className="w-full">
                {mutation.isPending ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Drafting…</>
                ) : (
                  <><Wand2 className="mr-2 h-4 w-4" /> Generate Email</>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <AiOutput
          text={mutation.data?.text}
          loading={mutation.isPending}
          placeholder="Your drafted email will appear here."
        />
      </div>
    </PageShell>
  );
}
