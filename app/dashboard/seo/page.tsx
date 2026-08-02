"use client";

import { useState } from "react";
import { Search, Loader2, Copy, Check, Info } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { api, ApiError, type SeoMetadata } from "@/lib/api";

function CopyButton({ text, label }: { text: string; label?: string }) {
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
      {copied ? "Copied" : label || "Copy"}
    </button>
  );
}

export default function SeoPage() {
  const [topic, setTopic] = useState("");
  const [existingTitle, setExistingTitle] = useState("");
  const [result, setResult] = useState<SeoMetadata | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleGenerate() {
    if (!topic.trim()) {
      setError("Describe the video's topic or paste an outline/transcript first.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await api.generateSeo({ topic, existing_title: existingTitle.trim() || undefined });
      setResult(res);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not reach the CreatorForge API.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="AI SEO Engine"
        description="Generate optimised titles, descriptions, tags, chapters and keywords for your video."
      />

      <Card className="mb-6">
        <CardHeader>
          <h2 className="font-semibold text-zinc-900 dark:text-white">Optimise a video</h2>
        </CardHeader>
        <CardBody>
          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            rows={5}
            placeholder="Describe the video, or paste an outline or transcript excerpt — e.g. 'A 10 minute tutorial on setting up a home recording studio for YouTube, covering mic placement, lighting and a budget audio interface.'"
            className="w-full resize-none rounded-lg border border-zinc-200 bg-transparent p-3 text-sm outline-none focus:border-brand-500 dark:border-zinc-700"
          />
          <input
            value={existingTitle}
            onChange={(e) => setExistingTitle(e.target.value)}
            placeholder="Current working title (optional)"
            className="mt-3 w-full rounded-lg border border-zinc-200 bg-transparent px-3 py-2.5 text-sm outline-none focus:border-brand-500 dark:border-zinc-700"
          />
          {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
          <div className="mt-3 flex justify-end">
            <Button onClick={handleGenerate} disabled={loading} className="gap-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              {loading ? "Optimising..." : "Optimise this video"}
            </Button>
          </div>
        </CardBody>
      </Card>

      {result && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader className="flex items-center justify-between">
              <h2 className="font-semibold text-zinc-900 dark:text-white">Title</h2>
              <CopyButton text={result.title} />
            </CardHeader>
            <CardBody>
              <p className="text-sm text-zinc-800 dark:text-zinc-200">{result.title}</p>
            </CardBody>
          </Card>

          <Card>
            <CardHeader className="flex items-center justify-between">
              <h2 className="font-semibold text-zinc-900 dark:text-white">Description</h2>
              <CopyButton text={result.description} />
            </CardHeader>
            <CardBody>
              <p className="max-h-40 overflow-y-auto whitespace-pre-wrap text-sm text-zinc-800 dark:text-zinc-200">
                {result.description}
              </p>
            </CardBody>
          </Card>

          <Card>
            <CardHeader className="flex items-center justify-between">
              <h2 className="font-semibold text-zinc-900 dark:text-white">Tags</h2>
              <CopyButton text={result.tags.join(", ")} label="Copy all" />
            </CardHeader>
            <CardBody className="flex flex-wrap gap-1.5">
              {result.tags.map((t) => (
                <Badge key={t}>{t}</Badge>
              ))}
            </CardBody>
          </Card>

          <Card>
            <CardHeader className="flex items-center justify-between">
              <h2 className="font-semibold text-zinc-900 dark:text-white">Hashtags</h2>
              <CopyButton text={result.hashtags.join(" ")} label="Copy all" />
            </CardHeader>
            <CardBody className="flex flex-wrap gap-1.5">
              {result.hashtags.map((t) => (
                <Badge key={t} tone="brand">{t}</Badge>
              ))}
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="font-semibold text-zinc-900 dark:text-white">Chapters</h2>
            </CardHeader>
            <CardBody>
              <ol className="space-y-1.5 text-sm text-zinc-700 dark:text-zinc-300">
                {result.chapters.map((c, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-zinc-400">{i + 1}.</span> {c}
                  </li>
                ))}
              </ol>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="font-semibold text-zinc-900 dark:text-white">Keyword focus</h2>
            </CardHeader>
            <CardBody className="flex flex-wrap gap-1.5">
              {result.keyword_focus.map((k) => (
                <Badge key={k} tone="success">{k}</Badge>
              ))}
            </CardBody>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader className="flex items-center gap-2">
              <Info className="h-4 w-4 text-zinc-400" />
              <h2 className="font-semibold text-zinc-900 dark:text-white">AI assessment</h2>
            </CardHeader>
            <CardBody>
              <p className="text-sm text-zinc-600 dark:text-zinc-300">{result.assessment}</p>
              <p className="mt-3 text-xs text-zinc-400">
                Based on general SEO best practice, not live search or trends data — CreatorForge doesn't
                have a real-time keyword or ranking data source connected yet.
              </p>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
}
