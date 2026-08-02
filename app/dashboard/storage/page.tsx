"use client";

import { HardDrive, Folder, Upload } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

const folders = [
  { name: "2026 Uploads", items: 24, size: "48.2 GB" },
  { name: "Sponsor: NordVPN", items: 6, size: "5.1 GB" },
  { name: "B-roll library", items: 312, size: "112.7 GB" },
  { name: "Podcast raws", items: 18, size: "22.4 GB" },
];

export default function StoragePage() {
  return (
    <div>
      <PageHeader
        title="Cloud Storage"
        description="Your creator workspace — organised by project, client, date and tags, with automatic backups."
        action={<Button className="gap-2"><Upload className="h-4 w-4" /> Upload footage</Button>}
      />

      <Card className="mb-6">
        <CardBody className="flex items-center gap-4">
          <HardDrive className="h-8 w-8 text-brand-600" />
          <div className="flex-1">
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="font-medium text-zinc-700 dark:text-zinc-300">188.4 GB of 2 TB used</span>
              <span className="text-zinc-400">9%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-zinc-100 dark:bg-zinc-800">
              <div className="h-2 w-[9%] rounded-full bg-brand-500" />
            </div>
          </div>
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {folders.map((f) => (
          <Card key={f.name}>
            <CardBody className="flex items-center gap-3">
              <Folder className="h-5 w-5 text-brand-600" />
              <div>
                <p className="text-sm font-medium text-zinc-900 dark:text-white">{f.name}</p>
                <p className="text-xs text-zinc-400">{f.items} items · {f.size}</p>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
