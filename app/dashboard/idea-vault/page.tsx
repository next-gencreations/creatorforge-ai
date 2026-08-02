"use client";

import { useEffect, useState } from "react";
import { Lightbulb, Wand2, Plus, Trash2, Loader2, Copy, Check } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { api, ApiError, IDEA_SOURCES, type Idea } from "@/lib/api";

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

export default function IdeaVaultPage() {
  const [ideas, setIdeas] = useState<Idea[] | null>(null);
  const [source, setSource] = useState("Note");
  const [content, setContent] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scripts, setScripts] = useState<Record<number, string>>({});
  const [scriptLoading, setScriptLoading] = useState<number | null>(null);
  const [scriptError, setScriptError] = useState<Record<number, string>>({});

  async function load() {
    try {
      setIdeas(await api.listIdeas());
    } catch {
      setIdeas([]);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setAdding(true);
    setError(null);
    try {
      await api.createIdea({ source, content: content.trim() });
      setContent("");
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not reach the CreatorForge API.");
    } finally {
      setAdding(false);
    }
  }

  async function handleDelete(id: number) {
    await api.deleteIdea(id);
    setIdeas((prev) => (prev ? prev.filter((i) => i.id !== id) : prev));
  }

  async function handleTurnIntoScript(idea: Idea) {
    setScriptLoading(idea.id);
    setScriptError((prev) => ({ ...prev, [idea.id]: "" }));
    try {
      const res = await api.generateScript({ mode: "script", prompt: idea.content });
      setScripts((prev) => ({ ...prev, [idea.id]: res.content }));
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Could not reach the CreatorForge API.";
      setScriptError((prev) => ({ ...prev, [idea.id]: message }));
    } finally {
      setScriptLoading(null);
    }
  }

  return (
    <div>
      <PageHeader
        title="AI Idea Vault"
        description="Never run out of content — capture ideas as you find them, then turn any of them into a script."
      />

      <Card className="mb-6">
        <CardHeader>
          <h2 className="font-semibold text-zinc-900 dark:text-white">Add an idea</h2>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleAdd} className="space-y-3">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
              placeholder="What's the idea? A note to yourself, something from a Reddit thread, a comment someone left, a headline you saw..."
              className="w-full resize-none rounded-lg border border-zinc-200 bg-transparent p-3 text-sm outline-none focus:border-brand-500 dark:border-zinc-700"
            />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <input
                list="idea-sources"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-44 rounded-lg border border-zinc-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-zinc-700"
              />
              <datalist id="idea-sources">
                {IDEA_SOURCES.map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
              <Button type="submit" disabled={adding} className="gap-2">
                {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                {adding ? "Adding..." : "Add idea"}
              </Button>
            </div>
            {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
          </form>
        </CardBody>
      </Card>

      {ideas === null ? (
        <p className="py-8 text-center text-sm text-zinc-400">Loading ideas...</p>
      ) : ideas.length === 0 ? (
        <Card>
          <CardBody className="flex flex-col items-center gap-2 py-12 text-center">
            <Lightbulb className="h-8 w-8 text-zinc-300 dark:text-zinc-700" />
            <p className="text-sm text-zinc-500 dark:text-zinc-400">No ideas yet — add one above.</p>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-3">
          {ideas.map((item) => (
            <Card key={item.id}>
              <CardBody>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400">
                      <Lightbulb className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-zinc-900 dark:text-white">{item.content}</p>
                      <Badge className="mt-1">{item.source}</Badge>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleTurnIntoScript(item)}
                      disabled={scriptLoading === item.id}
                      className="gap-1.5"
                    >
                      {scriptLoading === item.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Wand2 className="h-3.5 w-3.5" />
                      )}
                      Turn into script
                    </Button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="rounded-md p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
                      aria-label="Delete idea"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {scriptError[item.id] && (
                  <p className="mt-3 text-sm text-red-600 dark:text-red-400">{scriptError[item.id]}</p>
                )}

                {scripts[item.id] && (
                  <div className="mt-3 rounded-xl border border-zinc-100 dark:border-zinc-800">
                    <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-2 dark:border-zinc-800">
                      <span className="text-xs font-medium uppercase text-zinc-400">Generated script</span>
                      <CopyButton text={scripts[item.id]} />
                    </div>
                    <pre className="max-h-72 overflow-y-auto whitespace-pre-wrap p-4 text-sm text-zinc-700 dark:text-zinc-300">
                      {scripts[item.id]}
                    </pre>
                  </div>
                )}
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
