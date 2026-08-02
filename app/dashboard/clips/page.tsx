"use client";

import { Scissors, Play } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { clipCandidates } from "@/lib/mock-data";

const destinations = ["TikTok", "Shorts", "Instagram Reels", "Facebook Reels", "Snapchat Spotlight"];

export default function ClipsPage() {
  return (
    <div>
      <PageHeader
        title="AI Clip Generator"
        description="CreatorForge scans your long-form video and surfaces the moments most likely to go viral."
        action={
          <Button className="gap-2">
            <Scissors className="h-4 w-4" /> Scan latest upload
          </Button>
        }
      />

      <div className="space-y-3">
        {clipCandidates.map((c) => (
          <Card key={c.id}>
            <CardBody className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-20 items-center justify-center rounded-lg bg-zinc-900 text-white">
                  <Play className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-900 dark:text-white">{c.timestamp}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">{c.reason}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge tone="brand">{c.score}/100 viral score</Badge>
                <Button size="sm" variant="outline">Create clip</Button>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      <Card className="mt-6">
        <CardBody className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Export to:</span>
          {destinations.map((d) => (
            <Badge key={d}>{d}</Badge>
          ))}
        </CardBody>
      </Card>
    </div>
  );
}
