"use client";

import { useState } from "react";
import { MessageSquare, Sparkles, Loader2, Copy, Check } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { api, ApiError, type CommentResult } from "@/lib/api";

const sentimentTone = { positive: "success", neutral: "default", negative: "warning" } as const;

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700"
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? "Copied" : "Copy reply"}
    </button>
  );
}

export default function CommentsPage() {
  const [raw, setRaw] = useState("");
  const [items, setItems] = useState<{ text: string; result: CommentResult }[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleAnalyze() {
    const lines = raw
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .slice(0, 20);

    if (lines.length === 0) {
      setError("Paste one or more comments first, one per line.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await api.moderateComments({ comments: lines });
      setItems(lines.map((text, i) => ({ text, result: res.results[i] })));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not reach the CreatorForge API.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Comment Manager"
        description="Paste comments and get real sentiment analysis, spam detection, and AI reply drafts."
      />

      <Card className="mb-6">
        <CardHeader>
          <h2 className="font-semibold text-zinc-900 dark:text-white">Comments to review</h2>
        </CardHeader>
        <CardBody>
          <textarea
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            rows={6}
            placeholder={"Paste comments here, one per line — e.g.\nThis edit is insane, what software?!\nCheck my page for free followers!!!"}
            className="w-full resize-none rounded-lg border border-zinc-200 bg-transparent p-3 text-sm outline-none focus:border-brand-500 dark:border-zinc-700"
          />
          {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
          <div className="mt-3 flex justify-end">
            <Button onClick={handleAnalyze} disabled={loading} className="gap-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageSquare className="h-4 w-4" />}
              {loading ? "Analyzing..." : "Analyze comments"}
            </Button>
          </div>
          <p className="mt-2 text-xs text-zinc-400">
            No platforms are connected yet — paste comments you've copied from YouTube, TikTok, etc. (up to 20 at
            a time).
          </p>
        </CardBody>
      </Card>

      {items && (
        <div className="space-y-3">
          {items.map(({ text, result }, i) => (
            <Card key={i}>
              <CardBody className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                    <MessageSquare className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-300">{text}</p>
                    {result.suggested_reply && (
                      <div className="mt-2 flex items-center gap-2 rounded-lg bg-zinc-50 px-3 py-2 dark:bg-zinc-900">
                        <Sparkles className="h-3.5 w-3.5 shrink-0 text-brand-500" />
                        <p className="text-sm text-zinc-700 dark:text-zinc-300">{result.suggested_reply}</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <Badge tone={result.is_spam ? "danger" : sentimentTone[result.sentiment]}>
                    {result.is_spam ? "spam" : result.sentiment}
                  </Badge>
                  {result.suggested_reply && <CopyButton text={result.suggested_reply} />}
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
