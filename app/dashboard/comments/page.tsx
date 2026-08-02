"use client";

import { MessageSquare, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { comments } from "@/lib/mock-data";

const sentimentTone = { positive: "success", neutral: "default", spam: "danger" } as const;

export default function CommentsPage() {
  return (
    <div>
      <PageHeader
        title="Comment Manager"
        description="Manage comments across every platform with AI replies, spam filtering and sentiment analysis."
      />

      <div className="space-y-3">
        {comments.map((c) => (
          <Card key={c.id}>
            <CardBody className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                  <MessageSquare className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-900 dark:text-white">
                    {c.author} <span className="font-normal text-zinc-400">on {c.platform}</span>
                  </p>
                  <p className="mt-0.5 text-sm text-zinc-600 dark:text-zinc-300">{c.text}</p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Badge tone={sentimentTone[c.sentiment as keyof typeof sentimentTone]}>{c.sentiment}</Badge>
                {c.sentiment !== "spam" && (
                  <Button size="sm" variant="outline" className="gap-1.5">
                    <Sparkles className="h-3.5 w-3.5" /> AI reply
                  </Button>
                )}
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
