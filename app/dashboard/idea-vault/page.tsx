"use client";

import { Lightbulb, Wand2 } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ideaVaultItems } from "@/lib/mock-data";

export default function IdeaVaultPage() {
  return (
    <div>
      <PageHeader
        title="AI Idea Vault"
        description="Never run out of content — ideas collected from notes, comments, trends and more."
      />

      <div className="space-y-3">
        {ideaVaultItems.map((item) => (
          <Card key={item.id}>
            <CardBody className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400">
                  <Lightbulb className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-900 dark:text-white">{item.idea}</p>
                  <Badge className="mt-1">{item.source}</Badge>
                </div>
              </div>
              <Button size="sm" variant="outline" className="gap-1.5">
                <Wand2 className="h-3.5 w-3.5" /> Turn into script
              </Button>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
