"use client";

import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { analyticsOverview, uploadSchedule } from "@/lib/mock-data";

export default function AnalyticsPage() {
  return (
    <div>
      <PageHeader title="Analytics" description="Views, watch time, revenue and audience behaviour in one place." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Views (30d)" value={analyticsOverview.views.value} delta={analyticsOverview.views.delta} trend={analyticsOverview.views.trend} />
        <StatCard label="Subscribers" value={analyticsOverview.subscribers.value} delta={analyticsOverview.subscribers.delta} trend={analyticsOverview.subscribers.trend} />
        <StatCard label="Watch time (hrs)" value={analyticsOverview.watchTimeHours.value} delta={analyticsOverview.watchTimeHours.delta} trend={analyticsOverview.watchTimeHours.trend} />
        <StatCard label="Revenue (30d)" value={analyticsOverview.revenue.value} delta={analyticsOverview.revenue.delta} trend={analyticsOverview.revenue.trend} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-zinc-900 dark:text-white">Audience activity by day</h2>
          </CardHeader>
          <CardBody>
            <div className="flex items-end justify-between gap-2">
              {uploadSchedule.map((d) => (
                <div key={d.day} className="flex flex-1 flex-col items-center gap-1.5">
                  <div className="flex h-32 w-full items-end rounded-md bg-zinc-100 dark:bg-zinc-800">
                    <div className="w-full rounded-md bg-brand-500" style={{ height: `${d.score}%` }} />
                  </div>
                  <span className="text-xs text-zinc-400">{d.day}</span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-zinc-900 dark:text-white">Key metrics</h2>
          </CardHeader>
          <CardBody className="grid grid-cols-2 gap-4 text-sm">
            {[
              ["CPM", "$8.42"],
              ["RPM", "$4.10"],
              ["Avg. retention", "58%"],
              ["Engagement rate", "6.7%"],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-zinc-400">{label}</p>
                <p className="text-lg font-semibold text-zinc-900 dark:text-white">{value}</p>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
