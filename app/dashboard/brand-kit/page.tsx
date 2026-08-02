"use client";

import { Palette, Type, Image as ImageIcon, LayoutTemplate } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { brandKitAssets } from "@/lib/mock-data";

export default function BrandKitPage() {
  return (
    <div>
      <PageHeader
        title="Brand Kit"
        description="Store your logos, fonts, colours and templates — applied automatically to every export."
      />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Card>
          <CardHeader className="flex items-center gap-2">
            <Palette className="h-4 w-4 text-brand-600" />
            <h2 className="font-semibold text-zinc-900 dark:text-white">Colours</h2>
          </CardHeader>
          <CardBody className="flex gap-3">
            {brandKitAssets.colors.map((c) => (
              <div key={c} className="flex flex-col items-center gap-1.5">
                <div className="h-12 w-12 rounded-lg border border-zinc-200 dark:border-zinc-800" style={{ backgroundColor: c }} />
                <span className="text-xs text-zinc-400">{c}</span>
              </div>
            ))}
          </CardBody>
        </Card>

        <Card>
          <CardHeader className="flex items-center gap-2">
            <Type className="h-4 w-4 text-brand-600" />
            <h2 className="font-semibold text-zinc-900 dark:text-white">Fonts</h2>
          </CardHeader>
          <CardBody className="space-y-2">
            {brandKitAssets.fonts.map((f) => (
              <p key={f} className="text-lg font-semibold text-zinc-900 dark:text-white">{f}</p>
            ))}
          </CardBody>
        </Card>

        <Card>
          <CardHeader className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-brand-600" />
            <h2 className="font-semibold text-zinc-900 dark:text-white">Logos & watermarks</h2>
          </CardHeader>
          <CardBody className="space-y-2 text-sm text-zinc-600 dark:text-zinc-300">
            {brandKitAssets.logos.map((l) => (
              <p key={l}>{l}</p>
            ))}
          </CardBody>
        </Card>

        <Card>
          <CardHeader className="flex items-center gap-2">
            <LayoutTemplate className="h-4 w-4 text-brand-600" />
            <h2 className="font-semibold text-zinc-900 dark:text-white">Intro / outro / sponsor templates</h2>
          </CardHeader>
          <CardBody className="space-y-2 text-sm text-zinc-600 dark:text-zinc-300">
            {brandKitAssets.templates.map((t) => (
              <p key={t}>{t}</p>
            ))}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
