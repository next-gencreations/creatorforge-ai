"use client";

import { useEffect, useState } from "react";
import { Mic, Play, Download, Trash2, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { api, ApiError, VOICE_CHOICES, type StorageFile } from "@/lib/api";

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

function TrackPlayer({ file, onDelete }: { file: StorageFile; onDelete: (id: number) => void }) {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePlay() {
    if (url) return;
    setLoading(true);
    setError(null);
    try {
      const blob = await api.fetchStorageFileBlob(file.id);
      setUrl(URL.createObjectURL(blob));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not load this file.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardBody className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white">
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Mic className="h-3.5 w-3.5" />}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-zinc-900 dark:text-white">{file.filename}</p>
            <p className="text-xs text-zinc-400">
              {formatBytes(file.size_bytes)} · {new Date(file.created_at).toLocaleDateString()}
            </p>
            {url && <audio className="mt-2 h-8 w-full max-w-xs" controls autoPlay src={url} />}
            {error && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {!url && (
            <button
              onClick={handlePlay}
              className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-brand-600 dark:hover:bg-zinc-800"
              aria-label="Play"
            >
              <Play className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={() => api.downloadStorageFile(file.id, file.filename)}
            className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-brand-600 dark:hover:bg-zinc-800"
            aria-label="Download"
          >
            <Download className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(file.id)}
            className="rounded-md p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
            aria-label="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </CardBody>
    </Card>
  );
}

export default function AudioStudioPage() {
  const [script, setScript] = useState("");
  const [voice, setVoice] = useState<string>(VOICE_CHOICES[0]);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [voiceovers, setVoiceovers] = useState<StorageFile[] | null>(null);

  async function load() {
    try {
      const files = await api.listStorageFiles();
      setVoiceovers(files.filter((f) => f.folder === "Voiceovers"));
    } catch {
      setVoiceovers([]);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(id: number) {
    await api.deleteStorageFile(id);
    await load();
  }

  async function handleGenerate() {
    if (!script.trim()) {
      setError("Write a script for the voiceover first.");
      return;
    }
    setGenerating(true);
    setError(null);
    try {
      await api.generateVoiceover({ script, voice });
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not reach the CreatorForge API.");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="AI Audio Studio"
        description="Write a script and generate a real AI voiceover, powered by ElevenLabs."
      />

      <Card className="mb-6">
        <CardHeader>
          <h2 className="font-semibold text-zinc-900 dark:text-white">Generate voiceover</h2>
        </CardHeader>
        <CardBody>
          <textarea
            value={script}
            onChange={(e) => setScript(e.target.value)}
            rows={6}
            placeholder="Write the voiceover script exactly as you want it read aloud..."
            className="w-full resize-none rounded-lg border border-zinc-200 bg-transparent p-3 text-sm outline-none focus:border-brand-500 dark:border-zinc-700"
          />
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Voice:</span>
              <select
                value={voice}
                onChange={(e) => setVoice(e.target.value)}
                className="rounded-lg border border-zinc-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-zinc-700"
              >
                {VOICE_CHOICES.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            <Button onClick={handleGenerate} disabled={generating} className="gap-2">
              {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mic className="h-4 w-4" />}
              {generating ? "Generating..." : "Generate voiceover"}
            </Button>
          </div>
          {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
        </CardBody>
      </Card>

      {voiceovers === null ? (
        <p className="py-8 text-center text-sm text-zinc-400">Loading voiceovers...</p>
      ) : voiceovers.length === 0 ? (
        <Card>
          <CardBody className="flex flex-col items-center gap-2 py-12 text-center">
            <Mic className="h-8 w-8 text-zinc-300 dark:text-zinc-700" />
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              No voiceovers yet — write a script above to generate one.
            </p>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-3">
          {voiceovers.map((file) => (
            <TrackPlayer key={file.id} file={file} onDelete={handleDelete} />
          ))}
        </div>
      )}

      <p className="mt-4 text-xs text-zinc-400">
        Generated voiceovers are saved to your Cloud Storage under the &quot;Voiceovers&quot; folder. Intro music,
        background beds, sound effects, and podcast mastering are not yet available.
      </p>
    </div>
  );
}
