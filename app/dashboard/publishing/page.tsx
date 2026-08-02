"use client";

import { Youtube, Send, Link2, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { publishingPlatforms } from "@/lib/mock-data";

export default function PublishingPage() {
  return (
    <div>
      <PageHeader
        title="AI Publishing Hub"
        description="Connect your accounts once — CreatorForge formats, schedules and cross-posts everywhere."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {publishingPlatforms.map((p) => (
          <Card key={p.name}>
            <CardBody className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                  <Youtube className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium text-zinc-900 dark:text-white">{p.name}</span>
              </div>
              {p.connected ? (
                <Badge tone="success" className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Connected
                </Badge>
              ) : (
                <Button size="sm" variant="outline" className="gap-1">
                  <Link2 className="h-3.5 w-3.5" /> Connect
                </Button>
              )}
            </CardBody>
          </Card>
        ))}
      </div>

      <Card className="mt-6">
        <CardHeader>
          <h2 className="font-semibold text-zinc-900 dark:text-white">Cross-post a project</h2>
        </CardHeader>
        <CardBody>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Once a project is marked "ready" in the AI Video Editor, publish it here — CreatorForge automatically
            reframes, retitles and reformats the export for each connected platform.
          </p>
          <Button className="mt-4 gap-2">
            <Send className="h-4 w-4" /> Publish next ready project
          </Button>
        </CardBody>
      </Card>
    </div>
  );
}
