"use client";

import { useState } from "react";
import { Captions as CaptionsIcon, Languages, Loader2, Download, Info } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { api, ApiError, type CaptionResult } from "@/lib/api";

const LANGUAGES = [
  "English", "Spanish", "French", "German", "Portuguese", "Hindi", "Japanese", "Korean",
  "Italian", "Dutch", "Arabic", "Mandarin Chinese",
];

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = (seconds % 60).toFixed(1).padStart(4, "0");
  return `${m}:${s}`;
}

export default function CaptionsPage() {
  const [transcript, setTranscript] = useState("");
  const [language, setLanguage] = useState("English");
  const [emoji, setEmoji] = useState(false);
  const [result, setResult] = useState<CaptionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleGenerate() {
    if (!transcript.trim()) {
      setError("Paste or type a transcript or script first.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await api.generateCaptions({ transcript, language, emoji });
      setResult(res);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not reach the CreatorForge API.");
    } finally {
      setLoading(false);
    }
  }

  function downloadSrt() {
    if (!result) return;
    const blob = new Blob([result.srt], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "captions.srt";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <PageHeader
        title="AI Caption Generator"
        description="Turn a transcript or script into properly-timed, translatable caption cues you can export as .srt."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <h2 className="font-semibold text-zinc-900 dark:text-white">Transcript</h2>
          </CardHeader>
          <CardBody>
            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              rows={8}
              placeholder="Paste or type your video's script or transcript here..."
              className="w-full resize-none rounded-lg border border-zinc-200 bg-transparent p-3 text-sm outline-none focus:border-brand-500 dark:border-zinc-700"
            />

            <div className="mt-3 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <Languages className="h-4 w-4 text-zinc-400" />
                <input
                  list="caption-languages"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-40 rounded-lg border border-zinc-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-zinc-700"
                />
                <datalist id="caption-languages">
                  {LANGUAGES.map((l) => (
                    <option key={l} value={l} />
                  ))}
                </datalist>
              </div>

              <div className="flex overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-700">
                <button
                  onClick={() => setEmoji(false)}
                  className={`px-3 py-2 text-sm font-medium ${!emoji ? "bg-brand-600 text-white" : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"}`}
                >
                  Classic
                </button>
                <button
                  onClick={() => setEmoji(true)}
                  className={`px-3 py-2 text-sm font-medium ${emoji ? "bg-brand-600 text-white" : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"}`}
                >
                  Emoji captions
                </button>
              </div>
            </div>

            {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}

            <div className="mt-3 flex justify-end">
              <Button onClick={handleGenerate} disabled={loading} className="gap-2">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CaptionsIcon className="h-4 w-4" />}
                {loading ? "Generating..." : "Generate captions"}
              </Button>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader className="flex items-center justify-between">
            <h2 className="font-semibold text-zinc-900 dark:text-white">Preview</h2>
            {result && (
              <button onClick={downloadSrt} className="flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700">
                <Download className="h-3.5 w-3.5" /> .srt
              </button>
            )}
          </CardHeader>
          <CardBody>
            <div className="flex aspect-video items-end justify-center rounded-xl bg-zinc-900 p-4">
              <span className="rounded-md bg-black/70 px-3 py-1.5 text-center text-sm font-bold text-white">
                {result ? result.cues[0]?.text : "“Your captions will preview here.”"}
              </span>
            </div>
            {!result && (
              <p className="mt-3 text-xs text-zinc-400">
                Timing is estimated from reading pace, not synced to real audio — nudge the
                downloaded .srt against your actual video when you import it.
              </p>
            )}
          </CardBody>
        </Card>
      </div>

      {result && (
        <Card className="mt-6">
          <CardHeader className="flex items-center gap-2">
            <Info className="h-4 w-4 text-zinc-400" />
            <h2 className="font-semibold text-zinc-900 dark:text-white">Caption cues</h2>
          </CardHeader>
          <CardBody className="space-y-2">
            {result.cues.map((cue) => (
              <div key={cue.index} className="flex items-start gap-3 border-b border-zinc-50 pb-2 text-sm last:border-0 dark:border-zinc-900">
                <span className="w-28 shrink-0 font-mono text-xs text-zinc-400">
                  {formatTime(cue.start)} – {formatTime(cue.end)}
                </span>
                <span className="whitespace-pre-line text-zinc-700 dark:text-zinc-300">{cue.text}</span>
              </div>
            ))}
            <p className="pt-2 text-xs text-zinc-400">
              Estimated timing from script pacing (~15 characters/second) — not synced to real audio.
            </p>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
