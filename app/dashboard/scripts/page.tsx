"use client";

import { useState } from "react";
import { Wand2, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { scriptTemplates } from "@/lib/mock-data";

export default function ScriptsPage() {
  const [prompt, setPrompt] = useState("");

  return (
    <div>
      <PageHeader
        title="AI Script Assistant"
        description="Brainstorm ideas, generate scripts, and craft hooks that keep viewers watching."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <h2 className="font-semibold text-zinc-900 dark:text-white">Write with AI</h2>
          </CardHeader>
          <CardBody>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={8}
              placeholder="Describe your video idea — e.g. 'A 10 minute vlog about my first week running a home studio, upbeat tone, ends with a sponsor read for Skillshare.'"
              className="w-full resize-none rounded-lg border border-zinc-200 bg-transparent p-3 text-sm outline-none focus:border-brand-500 dark:border-zinc-700"
            />
            <div className="mt-3 flex justify-end">
              <Button className="gap-2">
                <Wand2 className="h-4 w-4" /> Generate script
              </Button>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="font-semibold text-zinc-900 dark:text-white">Templates</h2>
          </CardHeader>
          <CardBody className="space-y-3">
            {scriptTemplates.map((t) => (
              <button
                key={t.id}
                className="w-full rounded-lg border border-zinc-100 p-3 text-left hover:border-brand-300 dark:border-zinc-800 dark:hover:border-brand-700"
              >
                <p className="flex items-center gap-1.5 text-sm font-medium text-zinc-900 dark:text-white">
                  <Sparkles className="h-3.5 w-3.5 text-brand-500" /> {t.name}
                </p>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{t.description}</p>
              </button>
            ))}
          </CardBody>
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
        {["Hook generator", "Storytelling assistant", "Call-to-action suggestions"].map((label) => (
          <Card key={label}>
            <CardBody className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{label}</CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
