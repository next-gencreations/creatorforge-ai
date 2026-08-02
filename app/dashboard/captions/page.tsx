"use client";

import { Captions as CaptionsIcon, Languages } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

const styles = ["Classic subtitles", "Animated captions", "Emoji captions", "Burned-in captions"];
const languages = ["English", "Spanish", "French", "German", "Portuguese", "Hindi", "Japanese", "Korean", "+94 more"];

export default function CaptionsPage() {
  return (
    <div>
      <PageHeader
        title="AI Caption Generator"
        description="Subtitles, closed captions and multi-language translation in one pass."
        action={
          <Button className="gap-2">
            <CaptionsIcon className="h-4 w-4" /> Generate captions
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <h2 className="font-semibold text-zinc-900 dark:text-white">Preview</h2>
          </CardHeader>
          <CardBody>
            <div className="flex aspect-video items-end justify-center rounded-xl bg-zinc-900 p-6">
              <span className="rounded-md bg-black/70 px-3 py-1.5 text-lg font-bold text-white">
                "This changes everything." 🔥
              </span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {styles.map((s) => (
                <Badge key={s} tone="brand">{s}</Badge>
              ))}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader className="flex items-center gap-2">
            <Languages className="h-4 w-4 text-brand-600" />
            <h2 className="font-semibold text-zinc-900 dark:text-white">100+ languages</h2>
          </CardHeader>
          <CardBody>
            <div className="flex flex-wrap gap-1.5">
              {languages.map((l) => (
                <Badge key={l}>{l}</Badge>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
