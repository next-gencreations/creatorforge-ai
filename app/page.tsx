import Link from "next/link";
import {
  Sparkles,
  Film,
  Image as ImageIcon,
  Search,
  Send,
  BarChart3,
  Compass,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

const features = [
  {
    icon: Film,
    title: "AI Video Editor",
    description: "Auto scene detection, silence removal, smart zooms, face tracking and cinematic colour grading.",
  },
  {
    icon: ImageIcon,
    title: "AI Thumbnail Creator",
    description: "Generate and A/B test thumbnails with click-through predictions before you publish.",
  },
  {
    icon: Search,
    title: "AI SEO Engine",
    description: "Titles, descriptions, tags and chapters — optimised against real search trend data.",
  },
  {
    icon: Send,
    title: "AI Publishing Hub",
    description: "Upload once, auto-format and cross-post to every platform your audience lives on.",
  },
  {
    icon: BarChart3,
    title: "Creator Dashboard",
    description: "Views, watch time, revenue and retention — all in one live view of your channel.",
  },
  {
    icon: Compass,
    title: "AI Growth Coach",
    description: "Daily, personalised advice on what to post next and why your last video performed the way it did.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-zinc-900 dark:bg-zinc-950 dark:text-white">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="text-lg font-bold">CreatorForge AI</span>
        </div>
        <nav className="flex items-center gap-3">
          <Link href="/login" className="hidden text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white sm:block">
            Log in
          </Link>
          <Link href="/signup">
            <Button size="sm">Get started free</Button>
          </Link>
        </nav>
      </header>

      <section className="mx-auto max-w-4xl px-6 pb-20 pt-16 text-center sm:pt-24">
        <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-zinc-200 px-3 py-1 text-xs font-medium text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
          <Sparkles className="h-3.5 w-3.5 text-brand-500" />
          The complete AI studio for creators
        </div>
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          Record Once.
          <br />
          <span className="text-brand-600">Let AI Do the Rest.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-500 dark:text-zinc-400">
          CreatorForge AI edits, thumbnails, captions, clips, optimises and publishes your content across every
          platform — so you can spend less time in the timeline and more time creating.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/signup">
            <Button size="lg" className="gap-2">
              Start creating for free <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline">
              Log in
            </Button>
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-zinc-200 py-8 dark:border-zinc-800">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 text-sm text-zinc-500 dark:text-zinc-400 sm:flex-row">
          <span>© {new Date().getFullYear()} CreatorForge AI</span>
          <span>Create once. Publish everywhere.</span>
        </div>
      </footer>
    </main>
  );
}
