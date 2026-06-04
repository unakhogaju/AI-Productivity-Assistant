import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import ReactMarkdown from "react-markdown";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function AiOutput({
  text,
  loading,
  placeholder = "Output will appear here.",
}: {
  text?: string;
  loading?: boolean;
  placeholder?: string;
}) {
  const [copied, setCopied] = useState(false);

  if (loading) {
    return (
      <Card className="p-5">
        <div className="space-y-3">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-11/12" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </Card>
    );
  }

  if (!text) {
    return (
      <Card className="flex min-h-[180px] items-center justify-center p-6 text-sm text-muted-foreground">
        {placeholder}
      </Card>
    );
  }

  return (
    <Card className="relative p-5">
      <Button
        size="icon-sm"
        variant="ghost"
        className="absolute right-3 top-3"
        onClick={() => {
          navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }}
        aria-label="Copy output"
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </Button>
      <div className="prose-output pr-8">
        <ReactMarkdown>{text}</ReactMarkdown>
      </div>
    </Card>
  );
}
