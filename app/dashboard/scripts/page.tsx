"use client";

import { useState } from "react";
import { Wand2, Sparkles, Copy, Check, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { scriptTemplates } from "@/lib/mock-data";
import { api, ApiError, type ScriptMode } from "@/lib/api";

const quickTools: { label: string; mode: ScriptMode }[] = [
  { label: "Hook generator", mode: "hook" },
  { label: "Storytelling assistant", mode: "storytelling" },
  { label: "Call-to-action suggestions", mode: "cta" },
];

export default function ScriptsPage() {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function runGenerate(mode: ScriptMode, promptText: string, template?: string, loadingKey: string = mode) {
    setLoading(loadingKey);
    setError(null);
    try {
      const res = await api.generateScript({ mode, prompt: promptText, template });
      setResult(res.content);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not reach the CreatorForge API.");
    } finally {
      setLoading(null);
    }
  }

  function handleGenerateScript() {
    if (!prompt.trim()) {
      setError("Describe your video idea first.");
      return;
    }
    runGenerate("script", prompt);
  }

  function handleTemplateClick(template: { name: string; description: string }) {
    const effectivePrompt = prompt.trim() || `Create a video following this format: ${template.description}`;
    if (!prompt.trim()) setPrompt(effectivePrompt);
    runGenerate("script", effectivePrompt, template.name, template.name);
  }

  function handleQuickTool(mode: ScriptMode) {
    if (!prompt.trim()) {
      setError("Describe your video idea in the box first.");
      return;
    }
    runGenerate(mode, prompt);
  }

  async function handleCopy() {
    if (!result) return;
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div>
      <PageHeader
        title="AI Script Assistant"
        description="Brainstorm ideas, generate scripts, and craft hooks that keep viewers watching."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <h2 className="font-semibold text-zinc-900 dark:text-white">Write with AI</h2>
          </CardHeader>
          <CardBody>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={8}
              placeholder="Describe your video idea — e.g. 'A 10 minute vlog about my first week running a home studio, upbeat tone, ends with a sponsor read for Skillshare.'"
              className="w-full resize-none rounded-lg border border-zinc-200 bg-transparent p-3 text-sm outline-none focus:border-brand-500 dark:border-zinc-700"
            />
            {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
            <div className="mt-3 flex justify-end">
              <Button onClick={handleGenerateScript} disabled={loading !== null} className="gap-2">
                {loading === "script" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                {loading === "script" ? "Generating..." : "Generate script"}
              </Button>
            </div>

            {result && (
              <div className="mt-5 rounded-xl border border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-2 dark:border-zinc-800">
                  <span className="text-xs font-medium uppercase text-zinc-400">Generated content</span>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700"
                  >
                    {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>
                <pre className="max-h-96 overflow-y-auto whitespace-pre-wrap p-4 text-sm text-zinc-700 dark:text-zinc-300">
                  {result}
                </pre>
              </div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="font-semibold text-zinc-900 dark:text-white">Templates</h2>
          </CardHeader>
          <CardBody className="space-y-3">
            {scriptTemplates.map((t) => (
              <button
                key={t.id}
                onClick={() => handleTemplateClick(t)}
                disabled={loading !== null}
                className="w-full rounded-lg border border-zinc-100 p-3 text-left hover:border-brand-300 disabled:opacity-50 dark:border-zinc-800 dark:hover:border-brand-700"
              >
                <p className="flex items-center gap-1.5 text-sm font-medium text-zinc-900 dark:text-white">
                  {loading === t.name ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-brand-500" />
                  ) : (
                    <Sparkles className="h-3.5 w-3.5 text-brand-500" />
                  )}
                  {t.name}
                </p>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{t.description}</p>
              </button>
            ))}
          </CardBody>
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
        {quickTools.map((tool) => (
          <Card key={tool.mode}>
            <button
              onClick={() => handleQuickTool(tool.mode)}
              disabled={loading !== null}
              className="flex w-full items-center justify-between p-5 text-left disabled:opacity-50"
            >
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{tool.label}</span>
              {loading === tool.mode ? (
                <Loader2 className="h-4 w-4 animate-spin text-brand-500" />
              ) : (
                <Wand2 className="h-4 w-4 text-brand-500" />
              )}
            </button>
          </Card>
        ))}
      </div>
    </div>
  );
}
