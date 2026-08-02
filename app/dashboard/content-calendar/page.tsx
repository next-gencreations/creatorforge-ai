"use client";

import { CalendarDays, Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { calendarItems } from "@/lib/mock-data";

const statusTone = { scheduled: "brand", draft: "default", deadline: "warning" } as const;

export default function ContentCalendarPage() {
  return (
    <div>
      <PageHeader
        title="Content Calendar"
        description="Plan campaigns, sponsor deadlines and uploads months ahead."
        action={
          <Button className="gap-2">
            <Plus className="h-4 w-4" /> Add to calendar
          </Button>
        }
      />

      <div className="space-y-3">
        {calendarItems.map((item, i) => (
          <Card key={i}>
            <CardBody className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 flex-col items-center justify-center rounded-lg bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                  <CalendarDays className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-900 dark:text-white">{item.title}</p>
                  <p className="text-xs text-zinc-400">{item.date} · {item.platform}</p>
                </div>
              </div>
              <Badge tone={statusTone[item.status as keyof typeof statusTone]}>{item.status}</Badge>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
