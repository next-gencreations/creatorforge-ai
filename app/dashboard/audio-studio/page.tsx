"use client";

import { Music, Mic, Play } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { audioLibrary } from "@/lib/mock-data";

export default function AudioStudioPage() {
  return (
    <div>
      <PageHeader
        title="AI Audio Studio"
        description="Generate intro music, background beds, sound effects and AI voiceovers."
        action={
          <Button className="gap-2">
            <Mic className="h-4 w-4" /> Generate voiceover
          </Button>
        }
      />

      <div className="space-y-3">
        {audioLibrary.map((track) => (
          <Card key={track.id}>
            <CardBody className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-white">
                  <Play className="h-3.5 w-3.5" />
                </button>
                <div>
                  <p className="text-sm font-medium text-zinc-900 dark:text-white">{track.name}</p>
                  <p className="text-xs text-zinc-400">{track.duration}</p>
                </div>
              </div>
              <Badge>{track.type}</Badge>
            </CardBody>
          </Card>
        ))}
      </div>

      <Card className="mt-6">
        <CardBody className="flex items-center gap-3">
          <Music className="h-5 w-5 text-brand-600" />
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Podcast cleanup, voice isolation and mastering also run through this studio — connect an audio file to
            apply them.
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
