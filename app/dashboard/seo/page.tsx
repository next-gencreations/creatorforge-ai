"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { seoKeywords } from "@/lib/mock-data";

const trendIcon = { up: TrendingUp, down: TrendingDown, flat: Minus };
const difficultyTone = { Low: "success", Medium: "warning", High: "danger" } as const;

export default function SeoPage() {
  return (
    <div>
      <PageHeader
        title="AI SEO Engine"
        description="Titles, descriptions, tags, chapters and keywords — optimised against live search trends."
        action={<Button>Optimise this video</Button>}
      />

      <Card className="mb-6">
        <CardHeader>
          <h2 className="font-semibold text-zinc-900 dark:text-white">Keyword opportunities</h2>
        </CardHeader>
        <CardBody className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 text-left text-zinc-400 dark:border-zinc-800">
                <th className="px-5 py-3 font-medium">Keyword</th>
                <th className="px-5 py-3 font-medium">Volume</th>
                <th className="px-5 py-3 font-medium">Difficulty</th>
                <th className="px-5 py-3 font-medium">Trend</th>
              </tr>
            </thead>
            <tbody>
              {seoKeywords.map((k) => {
                const Icon = trendIcon[k.trend as keyof typeof trendIcon];
                return (
                  <tr key={k.keyword} className="border-b border-zinc-50 last:border-0 dark:border-zinc-900">
                    <td className="px-5 py-3 font-medium text-zinc-900 dark:text-white">{k.keyword}</td>
                    <td className="px-5 py-3 text-zinc-500 dark:text-zinc-400">{k.volume}/mo</td>
                    <td className="px-5 py-3">
                      <Badge tone={difficultyTone[k.difficulty as keyof typeof difficultyTone]}>{k.difficulty}</Badge>
                    </td>
                    <td className="px-5 py-3">
                      <Icon className="h-4 w-4 text-zinc-400" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-zinc-900 dark:text-white">Generated metadata</h2>
          </CardHeader>
          <CardBody className="space-y-3 text-sm">
            <div>
              <p className="text-xs font-medium uppercase text-zinc-400">Title</p>
              <p className="text-zinc-800 dark:text-zinc-200">I Automated My Entire YouTube Channel With AI</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase text-zinc-400">Tags</p>
              <p className="text-zinc-800 dark:text-zinc-200">ai video editor, content automation, youtube growth</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase text-zinc-400">Chapters</p>
              <p className="text-zinc-800 dark:text-zinc-200">00:00 Intro · 01:12 The problem · 04:30 The fix</p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-zinc-900 dark:text-white">Predicted search ranking</h2>
          </CardHeader>
          <CardBody>
            <div className="flex items-center gap-4">
              <div className="text-4xl font-bold text-brand-600">#4</div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Estimated position for "ai video editor" within 14 days of publishing, based on current
                competition and channel authority.
              </p>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
