"use client";

import { Wallet } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { revenueStreams } from "@/lib/mock-data";

export default function RevenuePage() {
  const total = revenueStreams.reduce((sum, s) => sum + s.amount, 0);

  return (
    <div>
      <PageHeader title="Revenue Dashboard" description="Track income across every source in one financial view." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Total income (30d)" value={`$${total.toLocaleString()}`} delta="+9.2%" trend="up" />
        <StatCard label="Sponsorship share" value="59%" />
        <StatCard label="Avg. per video" value="$1,542" />
      </div>

      <Card className="mt-6">
        <CardHeader className="flex items-center gap-2">
          <Wallet className="h-4 w-4 text-brand-600" />
          <h2 className="font-semibold text-zinc-900 dark:text-white">Income by source</h2>
        </CardHeader>
        <CardBody className="space-y-4">
          {revenueStreams.map((s) => (
            <div key={s.source}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-medium text-zinc-700 dark:text-zinc-300">{s.source}</span>
                <span className="text-zinc-500 dark:text-zinc-400">
                  ${s.amount.toLocaleString()} <span className="text-emerald-600 dark:text-emerald-400">{s.change}</span>
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-zinc-100 dark:bg-zinc-800">
                <div
                  className="h-2 rounded-full bg-brand-500"
                  style={{ width: `${(s.amount / total) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </CardBody>
      </Card>
    </div>
  );
}
