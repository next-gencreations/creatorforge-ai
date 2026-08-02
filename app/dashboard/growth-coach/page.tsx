"use client";

import { Compass } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { growthCoachTips } from "@/lib/mock-data";

export default function GrowthCoachPage() {
  return (
    <div>
      <PageHeader
        title="AI Growth Coach"
        description="Your personal YouTube strategist — daily advice tailored to your channel's data."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {growthCoachTips.map((tip) => (
          <Card key={tip.title}>
            <CardBody>
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
                  <Compass className="h-4 w-4" />
                </div>
                <Badge tone="brand">{tip.tag}</Badge>
              </div>
              <p className="mt-3 font-medium text-zinc-900 dark:text-white">{tip.title}</p>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{tip.detail}</p>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
