"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Film, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { api, type Project } from "@/lib/api";
import { analyticsOverview, growthCoachTips, uploadSchedule } from "@/lib/mock-data";

const statusTone: Record<Project["status"], "default" | "success" | "warning" | "brand"> = {
  draft: "default",
  processing: "warning",
  ready: "brand",
  published: "success",
};

export default function DashboardOverview() {
  const [projects, setProjects] = useState<Project[] | null>(null);

  useEffect(() => {
    api.listProjects().then(setProjects).catch(() => setProjects([]));
  }, []);

  return (
    <div>
      <PageHeader
        title="Overview"
        description="Your channel at a glance."
        action={
          <Link href="/dashboard/editor">
            <button className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700">
              <Film className="h-4 w-4" /> New project
            </button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Views (30d)" value={analyticsOverview.views.value} delta={analyticsOverview.views.delta} trend={analyticsOverview.views.trend} />
        <StatCard label="Subscribers" value={analyticsOverview.subscribers.value} delta={analyticsOverview.subscribers.delta} trend={analyticsOverview.subscribers.trend} />
        <StatCard label="Watch time (hrs)" value={analyticsOverview.watchTimeHours.value} delta={analyticsOverview.watchTimeHours.delta} trend={analyticsOverview.watchTimeHours.trend} />
        <StatCard label="Revenue (30d)" value={analyticsOverview.revenue.value} delta={analyticsOverview.revenue.delta} trend={analyticsOverview.revenue.trend} />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex items-center justify-between">
            <h2 className="font-semibold text-zinc-900 dark:text-white">Recent projects</h2>
            <Link href="/dashboard/editor" className="flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          <CardBody>
            {projects === null ? (
              <p className="py-8 text-center text-sm text-zinc-400">Loading projects...</p>
            ) : projects.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-sm text-zinc-500 dark:text-zinc-400">No projects yet.</p>
                <Link href="/dashboard/editor" className="mt-2 inline-block text-sm font-medium text-brand-600 hover:text-brand-700">
                  Create your first project →
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {projects.slice(0, 5).map((p) => (
                  <div key={p.id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-medium text-zinc-900 dark:text-white">{p.title}</p>
                      <p className="text-xs text-zinc-400">{new Date(p.created_at).toLocaleDateString()}</p>
                    </div>
                    <Badge tone={statusTone[p.status]}>{p.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="font-semibold text-zinc-900 dark:text-white">Best upload times</h2>
          </CardHeader>
          <CardBody>
            <div className="flex items-end justify-between gap-1.5">
              {uploadSchedule.map((d) => (
                <div key={d.day} className="flex flex-1 flex-col items-center gap-1.5">
                  <div className="flex h-24 w-full items-end rounded-md bg-zinc-100 dark:bg-zinc-800">
                    <div
                      className="w-full rounded-md bg-brand-500"
                      style={{ height: `${d.score}%` }}
                    />
                  </div>
                  <span className="text-xs text-zinc-400">{d.day}</span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <h2 className="font-semibold text-zinc-900 dark:text-white">AI Growth Coach highlights</h2>
        </CardHeader>
        <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {growthCoachTips.slice(0, 4).map((tip) => (
            <div key={tip.title} className="rounded-xl border border-zinc-100 p-4 dark:border-zinc-800">
              <Badge tone="brand">{tip.tag}</Badge>
              <p className="mt-2 text-sm font-medium text-zinc-900 dark:text-white">{tip.title}</p>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{tip.detail}</p>
            </div>
          ))}
        </CardBody>
      </Card>
    </div>
  );
}
