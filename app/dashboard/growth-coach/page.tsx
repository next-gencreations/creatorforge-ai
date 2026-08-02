"use client";

import { useState } from "react";
import { Compass, Loader2, Lightbulb, ListChecks, Clock } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { api, ApiError, type GrowthCoachAdvice } from "@/lib/api";

export default function GrowthCoachPage() {
  const [context, setContext] = useState("");
  const [advice, setAdvice] = useState<GrowthCoachAdvice | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleAsk() {
    if (!context.trim()) {
      setError("Tell your coach about your channel first.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await api.getGrowthCoachAdvice({ context });
      setAdvice(res);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not reach the CreatorForge API.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="AI Growth Coach"
        description="Your personal YouTube strategist — tell it about your channel and get tailored advice."
      />

      <Card className="mb-6">
        <CardHeader>
          <h2 className="font-semibold text-zinc-900 dark:text-white">Tell your coach what's going on</h2>
        </CardHeader>
        <CardBody>
          <textarea
            value={context}
            onChange={(e) => setContext(e.target.value)}
            rows={5}
            placeholder="e.g. 'I run a home studio / AI editing tips channel, about 8K subscribers. My last 3 videos underperformed compared to usual. My best-performing video ever was a mic placement tutorial. I want to know what to try next.'"
            className="w-full resize-none rounded-lg border border-zinc-200 bg-transparent p-3 text-sm outline-none focus:border-brand-500 dark:border-zinc-700"
          />
          {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
          <div className="mt-3 flex justify-end">
            <Button onClick={handleAsk} disabled={loading} className="gap-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Compass className="h-4 w-4" />}
              {loading ? "Thinking..." : "Get advice"}
            </Button>
          </div>
          <p className="mt-2 text-xs text-zinc-400">
            CreatorForge doesn't have access to your real analytics or live trend data yet — advice is grounded
            in what you describe here plus general platform best practice, not measured numbers.
          </p>
        </CardBody>
      </Card>

      {advice && (
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex items-center gap-2">
              <Compass className="h-4 w-4 text-brand-600" />
              <h2 className="font-semibold text-zinc-900 dark:text-white">Diagnosis</h2>
            </CardHeader>
            <CardBody>
              <p className="text-sm text-zinc-700 dark:text-zinc-300">{advice.diagnosis}</p>
            </CardBody>
          </Card>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-brand-600" />
                <h2 className="font-semibold text-zinc-900 dark:text-white">Content ideas</h2>
              </CardHeader>
              <CardBody>
                <ul className="space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
                  {advice.content_ideas.map((idea, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-brand-500">•</span> {idea}
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>

            <Card>
              <CardHeader className="flex items-center gap-2">
                <ListChecks className="h-4 w-4 text-brand-600" />
                <h2 className="font-semibold text-zinc-900 dark:text-white">Priorities</h2>
              </CardHeader>
              <CardBody>
                <ol className="space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
                  {advice.priorities.map((p, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-zinc-400">{i + 1}.</span> {p}
                    </li>
                  ))}
                </ol>
              </CardBody>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-brand-600" />
              <h2 className="font-semibold text-zinc-900 dark:text-white">Upload timing</h2>
            </CardHeader>
            <CardBody>
              <p className="text-sm text-zinc-700 dark:text-zinc-300">{advice.upload_timing_tip}</p>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
}
