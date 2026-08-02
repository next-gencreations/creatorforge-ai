"use client";

import { useState } from "react";
import { Globe, Send, Link2, Loader2, Copy, Check, Info } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { api, ApiError, PUBLISHING_PLATFORMS, type PlatformVersion } from "@/lib/api";

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
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

export default function PublishingPage() {
  const [content, setContent] = useState("");
  const [selected, setSelected] = useState<string[]>(["YouTube", "TikTok", "X"]);
  const [versions, setVersions] = useState<PlatformVersion[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function toggle(platform: string) {
    setSelected((prev) => (prev.includes(platform) ? prev.filter((p) => p !== platform) : [...prev, platform]));
  }

  async function handleOptimize() {
    if (!content.trim()) {
      setError("Enter the title, description or caption you want to adapt first.");
      return;
    }
    if (selected.length === 0) {
      setError("Pick at least one platform.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await api.optimizeForPlatforms({ content, platforms: selected });
      setVersions(res.versions);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not reach the CreatorForge API.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="AI Publishing Hub"
        description="Adapt one piece of content into a tailored version for every platform you post to."
      />

      <Card className="mb-6">
        <CardHeader>
          <h2 className="font-semibold text-zinc-900 dark:text-white">Connect accounts</h2>
        </CardHeader>
        <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PUBLISHING_PLATFORMS.map((p) => (
            <div key={p} className="flex flex-col gap-3 rounded-xl border border-zinc-100 p-3 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                  <Globe className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <span className="block text-sm font-medium text-zinc-900 dark:text-white">{p}</span>
                  <span className="block text-xs text-zinc-400">OAuth not yet available</span>
                </div>
              </div>
              <Button size="sm" variant="outline" disabled className="w-full gap-1 opacity-50">
                <Link2 className="h-3.5 w-3.5" /> Connect
              </Button>
            </div>
          ))}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="font-semibold text-zinc-900 dark:text-white">Optimise content for each platform</h2>
        </CardHeader>
        <CardBody>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={5}
            placeholder="Paste a video title, description, or caption you'd like adapted for other platforms..."
            className="w-full resize-none rounded-lg border border-zinc-200 bg-transparent p-3 text-sm outline-none focus:border-brand-500 dark:border-zinc-700"
          />

          <div className="mt-3 flex flex-wrap gap-1.5">
            {PUBLISHING_PLATFORMS.map((p) => {
              const active = selected.includes(p);
              return (
                <button
                  key={p}
                  onClick={() => toggle(p)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    active
                      ? "bg-brand-600 text-white"
                      : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                  }`}
                >
                  {p}
                </button>
              );
            })}
          </div>

          {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}

          <div className="mt-3 flex justify-end">
            <Button onClick={handleOptimize} disabled={loading} className="gap-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {loading ? "Optimising..." : "Optimise for selected platforms"}
            </Button>
          </div>
        </CardBody>
      </Card>

      {versions && (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {versions.map((v) => (
            <Card key={v.platform}>
              <CardHeader className="flex items-center justify-between">
                <Badge tone="brand">{v.platform}</Badge>
                <CopyButton text={v.text} />
              </CardHeader>
              <CardBody>
                <p className="whitespace-pre-wrap text-sm text-zinc-800 dark:text-zinc-200">{v.text}</p>
                <div className="mt-3 flex items-start gap-1.5 text-xs text-zinc-400">
                  <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  {v.notes}
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
