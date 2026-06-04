import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider, DEFAULT_MODEL } from "./ai-gateway.server";

function getModel() {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("Missing LOVABLE_API_KEY");
  return createLovableAiGatewayProvider(key)(DEFAULT_MODEL);
}

// --- Email Generator ---
const EmailInput = z.object({
  recipient: z.string().min(1).max(200),
  purpose: z.string().min(1).max(2000),
  tone: z.enum(["professional", "friendly", "persuasive", "concise", "formal", "apologetic"]),
  audience: z.enum(["client", "colleague", "executive", "vendor", "team", "candidate"]),
});

export const generateEmail = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => EmailInput.parse(d))
  .handler(async ({ data }) => {
    const { text } = await generateText({
      model: getModel(),
      system:
        "You are an expert business communication assistant. Write polished, ready-to-send emails. Output only the email itself: a 'Subject:' line, then a blank line, then the body. No preamble, no explanations, no markdown fences.",
      prompt: `Write an email with the following parameters.

Recipient: ${data.recipient}
Audience type: ${data.audience}
Tone: ${data.tone}
Purpose / key points:
${data.purpose}

Requirements:
- Match the requested tone precisely.
- Keep it concise and skimmable.
- Use natural paragraphing, not bullet lists (unless the purpose clearly calls for a list).
- End with an appropriate sign-off.`,
    });
    return { text };
  });

// --- Meeting Notes Summarizer ---
const MeetingInput = z.object({
  notes: z.string().min(10).max(20000),
});

export const summarizeMeeting = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => MeetingInput.parse(d))
  .handler(async ({ data }) => {
    const { text } = await generateText({
      model: getModel(),
      system:
        "You are a meeting analyst. Convert raw meeting notes or transcripts into a clean, scannable executive summary. Always use the exact markdown section headings requested.",
      prompt: `Summarize the following meeting notes.

Output in markdown with these exact sections, in this order:
## Summary
A 2-3 sentence overview.

## Key Discussion Points
- bullet list

## Decisions Made
- bullet list (or "None recorded")

## Action Items
- [ ] **Owner** — task — *Deadline: YYYY-MM-DD or "TBD"*

## Open Questions
- bullet list (or "None")

---
Meeting notes:
${data.notes}`,
    });
    return { text };
  });

// --- Task Planner ---
const PlannerInput = z.object({
  tasks: z.string().min(5).max(5000),
  horizon: z.enum(["today", "this-week", "this-month"]),
});

export const planTasks = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => PlannerInput.parse(d))
  .handler(async ({ data }) => {
    const { text } = await generateText({
      model: getModel(),
      system:
        "You are a productivity coach who applies the Eisenhower matrix and time-blocking. Produce a prioritized, scheduled plan. Be decisive — assign priorities and time slots even when the user is vague.",
      prompt: `Plan the following tasks over the horizon: ${data.horizon}.

Tasks (raw input):
${data.tasks}

Output in markdown with these exact sections:

## Prioritization (Eisenhower)
- **Do First (Urgent + Important):** ...
- **Schedule (Important, Not Urgent):** ...
- **Delegate (Urgent, Not Important):** ...
- **Drop (Neither):** ...

## Suggested Schedule
A table with columns | Time | Task | Focus level (Deep/Shallow) |. Use realistic working blocks (90 min deep work, short shallow blocks). For "today" use clock times; for "this-week" use day + time; for "this-month" use week labels.

## Coaching Note
One short paragraph of practical advice tailored to this list.`,
    });
    return { text };
  });

// --- Research Assistant ---
const ResearchInput = z.object({
  topic: z.string().min(3).max(500),
  depth: z.enum(["brief", "standard", "deep"]),
});

export const researchTopic = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => ResearchInput.parse(d))
  .handler(async ({ data }) => {
    const { text } = await generateText({
      model: getModel(),
      system:
        "You are a senior research analyst. Synthesize what is generally known about a topic into a structured briefing. Be specific and concrete; avoid generic statements. Clearly flag uncertainty.",
      prompt: `Produce a ${data.depth} research briefing on: "${data.topic}".

Use this markdown structure:

## Executive Summary
3-4 sentences.

## Key Insights
- 5-7 sharp, non-obvious bullet points.

## Landscape & Key Players
Brief paragraphs or a short table.

## Opportunities & Risks
Two short subsections.

## Suggested Next Questions
- 4-6 questions that would deepen the research.

Note: You do not have live web access. Rely on general knowledge and clearly mark any claim that may be outdated with "(verify)".`,
    });
    return { text };
  });
