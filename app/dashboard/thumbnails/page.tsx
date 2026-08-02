"use client";

import { ImagePlus, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { thumbnailVariants } from "@/lib/mock-data";

export default function ThumbnailsPage() {
  return (
    <div>
      <PageHeader
        title="AI Thumbnail Creator"
        description="Generate, A/B test and score thumbnails before you publish."
        action={
          <Button className="gap-2">
            <ImagePlus className="h-4 w-4" /> Generate thumbnails
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {thumbnailVariants.map((v) => (
          <Card key={v.id}>
            <div className="flex aspect-video items-center justify-center rounded-t-2xl bg-gradient-to-br from-brand-200 to-brand-500 text-white dark:from-brand-900 dark:to-brand-700">
              <ImagePlus className="h-8 w-8 opacity-60" />
            </div>
            <CardBody>
              <div className="flex items-center justify-between">
                <p className="font-medium text-zinc-900 dark:text-white">{v.label}</p>
                <span className="flex items-center gap-1 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                  <TrendingUp className="h-3.5 w-3.5" /> {v.ctr}% predicted CTR
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {v.tags.map((t) => (
                  <Badge key={t}>{t}</Badge>
                ))}
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-zinc-900 dark:text-white">Enhancement tools</h2>
          </CardHeader>
          <CardBody className="space-y-2 text-sm text-zinc-600 dark:text-zinc-300">
            <p>• Facial expression enhancement</p>
            <p>• Background replacement</p>
            <p>• Trending thumbnail templates</p>
            <p>• Auto title suggestions to match</p>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-zinc-900 dark:text-white">Auto title suggestions</h2>
          </CardHeader>
          <CardBody className="space-y-2 text-sm text-zinc-600 dark:text-zinc-300">
            <p>"I Tried Editing 100 Videos With AI — Here's What Happened"</p>
            <p>"This AI Studio Replaced My Entire Editing Team"</p>
            <p>"The Last Video Editor You'll Ever Need"</p>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
