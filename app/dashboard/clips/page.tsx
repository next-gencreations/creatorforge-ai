"use client";

import { useState } from "react";
import { Scissors, Loader2, Copy, Check, Clock } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { api, ApiError, type ClipCandidate } from "@/lib/api";

const destinations = ["TikTok", "Shorts", "Instagram Reels", "Facebook Reels", "Snapchat Spotlight"];

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
      {copied ? "Copied" : "Copy caption"}
    </button>
  );
}

function scoreTone(score: number): "success" | "warning" | "danger" {
  if (score >= 70) return "success";
  if (score >= 40) return "warning";
  return "danger";
}

export default function ClipsPage() {
  const [transcript, setTranscript] = useState("");
  const [clips, setClips] = useState<ClipCandidate[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleGenerate() {
    if (!transcript.trim()) {
      setError("Paste a transcript or script first.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await api.generateClips({ transcript });
      setClips(res.clips);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not reach the CreatorForge API.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="AI Clip Generator"
        description="Paste a transcript and CreatorForge finds the moments most likely to work as standalone clips."
      />

      <Card className="mb-6">
        <CardHeader>
          <h2 className="font-semibold text-zinc-900 dark:text-white">Transcript</h2>
        </CardHeader>
        <CardBody>
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            rows={8}
            placeholder="Paste your video's transcript or script here. Include timestamps (e.g. '02:14') if you have them, for precise cut points."
            className="w-full resize-none rounded-lg border border-zinc-200 bg-transparent p-3 text-sm outline-none focus:border-brand-500 dark:border-zinc-700"
          />
          {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
          <div className="mt-3 flex justify-end">
            <Button onClick={handleGenerate} disabled={loading} className="gap-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Scissors className="h-4 w-4" />}
              {loading ? "Scanning..." : "Find viral moments"}
            </Button>
          </div>
        </CardBody>
      </Card>

      {clips && (
        <div className="space-y-3">
          {clips.map((c, i) => (
            <Card key={i}>
              <CardBody>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <blockquote className="border-l-2 border-brand-500 pl-3 text-sm italic text-zinc-800 dark:text-zinc-200">
                      &ldquo;{c.quote}&rdquo;
                    </blockquote>
                    <p className="mt-2 text-sm font-medium text-zinc-900 dark:text-white">{c.suggested_title}</p>
                    <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{c.reason}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
                    <Badge tone={scoreTone(c.score)}>{Math.round(c.score)}/100 shareability</Badge>
                    <span className="flex items-center gap-1 text-xs text-zinc-400">
                      <Clock className="h-3.5 w-3.5" />
                      {c.timestamp_hint ?? "No timestamp in transcript"}
                    </span>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between gap-3 rounded-lg bg-zinc-50 px-3 py-2 dark:bg-zinc-900">
                  <p className="text-sm text-zinc-700 dark:text-zinc-300">{c.platform_caption}</p>
                  <CopyButton text={c.platform_caption} />
                </div>
              </CardBody>
            </Card>
          ))}
          <p className="text-xs text-zinc-400">
            Shareability scores are a qualitative AI estimate from the transcript content, not a prediction of
            real views or platform performance.
          </p>
        </div>
      )}

      <Card className="mt-6">
        <CardBody className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Built for:</span>
          {destinations.map((d) => (
            <Badge key={d}>{d}</Badge>
          ))}
        </CardBody>
      </Card>
    </div>
  );
}
