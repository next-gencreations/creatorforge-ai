"use client";

import { useRef, useState } from "react";
import { ImagePlus, TrendingUp, Loader2, Copy, Check, Upload } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { api, ApiError, type ThumbnailAnalysis } from "@/lib/api";

const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];
const MAX_BYTES = 5 * 1024 * 1024;

function scoreTone(score: number): "success" | "warning" | "danger" {
  if (score >= 7) return "success";
  if (score >= 4) return "warning";
  return "danger";
}

export default function ThumbnailsPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [imageData, setImageData] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<string | null>(null);
  const [topic, setTopic] = useState("");
  const [result, setResult] = useState<ThumbnailAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  function handleFile(file: File) {
    setError(null);
    setResult(null);
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError("Use a PNG, JPEG, WEBP or GIF image.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("Image exceeds the 5MB limit.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setPreview(dataUrl);
      setImageData(dataUrl.split(",")[1]);
      setMediaType(file.type);
    };
    reader.readAsDataURL(file);
  }

  async function handleAnalyze() {
    if (!imageData || !mediaType) {
      setError("Choose a thumbnail image first.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await api.analyzeThumbnail({
        image_data: imageData,
        media_type: mediaType,
        video_topic: topic.trim() || undefined,
      });
      setResult(res);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not reach the CreatorForge API.");
    } finally {
      setLoading(false);
    }
  }

  async function copyTitle(title: string, index: number) {
    await navigator.clipboard.writeText(title);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  }

  return (
    <div>
      <PageHeader
        title="AI Thumbnail Creator"
        description="Upload a thumbnail and get a real, AI-scored click-through prediction plus title ideas."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-zinc-900 dark:text-white">Analyze your thumbnail</h2>
          </CardHeader>
          <CardBody>
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_TYPES.join(",")}
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-zinc-200 bg-zinc-50 text-zinc-400 hover:border-brand-400 hover:text-brand-500 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-brand-700"
            >
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview} alt="Thumbnail preview" className="h-full w-full rounded-xl object-cover" />
              ) : (
                <>
                  <Upload className="h-6 w-6" />
                  <span className="text-sm font-medium">Click to upload a thumbnail</span>
                  <span className="text-xs">PNG, JPEG, WEBP or GIF, up to 5MB</span>
                </>
              )}
            </button>

            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Video topic (optional) — e.g. 'AI editing tools for creators'"
              className="mt-3 w-full rounded-lg border border-zinc-200 bg-transparent px-3 py-2.5 text-sm outline-none focus:border-brand-500 dark:border-zinc-700"
            />

            {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}

            <Button onClick={handleAnalyze} disabled={loading} className="mt-3 w-full gap-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
              {loading ? "Analyzing..." : "Analyze thumbnail"}
            </Button>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="font-semibold text-zinc-900 dark:text-white">Results</h2>
          </CardHeader>
          <CardBody>
            {!result ? (
              <div className="flex h-full min-h-[240px] flex-col items-center justify-center gap-2 text-center text-sm text-zinc-400">
                <TrendingUp className="h-6 w-6" />
                Upload a thumbnail and analyze it to see a predicted CTR score and feedback here.
              </div>
            ) : (
              <div className="space-y-5">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-bold text-zinc-900 dark:text-white">
                      {result.ctr_score.toFixed(1)}
                      <span className="text-base font-medium text-zinc-400">/10</span>
                    </span>
                    <Badge tone={scoreTone(result.ctr_score)}>predicted CTR</Badge>
                  </div>
                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{result.score_rationale}</p>
                </div>

                <div>
                  <p className="mb-2 text-xs font-semibold uppercase text-zinc-400">Feedback</p>
                  <ul className="space-y-1.5 text-sm text-zinc-700 dark:text-zinc-300">
                    {result.feedback.map((f, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="text-brand-500">•</span> {f}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p className="mb-2 text-xs font-semibold uppercase text-zinc-400">Title suggestions</p>
                  <div className="space-y-1.5">
                    {result.title_suggestions.map((title, i) => (
                      <button
                        key={i}
                        onClick={() => copyTitle(title, i)}
                        className="flex w-full items-center justify-between gap-2 rounded-lg border border-zinc-100 px-3 py-2 text-left text-sm text-zinc-700 hover:border-brand-300 dark:border-zinc-800 dark:text-zinc-300 dark:hover:border-brand-700"
                      >
                        <span>&ldquo;{title}&rdquo;</span>
                        {copiedIndex === i ? (
                          <Check className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                        ) : (
                          <Copy className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader className="flex items-center justify-between">
          <h2 className="font-semibold text-zinc-900 dark:text-white">Coming soon</h2>
          <Badge>Requires an image-generation provider</Badge>
        </CardHeader>
        <CardBody className="space-y-2 text-sm text-zinc-500 dark:text-zinc-400">
          <p>• Generating new thumbnail images from a prompt</p>
          <p>• Facial expression enhancement</p>
          <p>• Background replacement</p>
          <p>• A/B thumbnail variant generation</p>
          <p>• Trending thumbnail templates</p>
        </CardBody>
      </Card>
    </div>
  );
}
