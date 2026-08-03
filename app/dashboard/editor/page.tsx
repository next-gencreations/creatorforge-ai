"use client";

import { useEffect, useState } from "react";
import { Film, Plus, Trash2, Scissors, Loader2, Clock, Layers, MonitorSmartphone } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { api, ApiError, PUBLISHING_PLATFORMS, type Project, type EditPlan } from "@/lib/api";

const statusTone: Record<Project["status"], "default" | "success" | "warning" | "brand"> = {
  draft: "default",
  processing: "warning",
  ready: "brand",
  published: "success",
};

export default function EditorPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState("");

  const [footageNotes, setFootageNotes] = useState("");
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [plan, setPlan] = useState<EditPlan | null>(null);
  const [planError, setPlanError] = useState<string | null>(null);
  const [planLoading, setPlanLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      setProjects(await api.listProjects());
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not reach the CreatorForge API.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function createProject(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setCreating(true);
    try {
      await api.createProject({ title: title.trim() });
      setTitle("");
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not create project.");
    } finally {
      setCreating(false);
    }
  }

  async function removeProject(id: number) {
    await api.deleteProject(id);
    setProjects((p) => p.filter((proj) => proj.id !== id));
  }

  function togglePlatform(platform: string) {
    setPlatforms((prev) => (prev.includes(platform) ? prev.filter((p) => p !== platform) : [...prev, platform]));
  }

  async function handleGeneratePlan() {
    if (!footageNotes.trim()) {
      setPlanError("Describe your footage or paste a timestamped transcript first.");
      return;
    }
    setPlanLoading(true);
    setPlanError(null);
    try {
      setPlan(await api.generateEditPlan({ footage_notes: footageNotes, platform_targets: platforms }));
    } catch (err) {
      setPlanError(err instanceof ApiError ? err.message : "Could not reach the CreatorForge API.");
    } finally {
      setPlanLoading(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="AI Video Editor"
        description="Manage your projects, then describe your raw footage to get an AI-drafted edit plan."
      />

      <Card className="mb-6">
        <CardBody>
          <form onSubmit={createProject} className="flex flex-col gap-3 sm:flex-row">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Untitled project name, e.g. 'Studio Tour Vlog'"
              className="flex-1 rounded-lg border border-zinc-200 bg-transparent px-3 py-2.5 text-sm outline-none focus:border-brand-500 dark:border-zinc-700"
            />
            <Button type="submit" disabled={creating} className="gap-2">
              <Plus className="h-4 w-4" /> {creating ? "Creating..." : "New project"}
            </Button>
          </form>
        </CardBody>
      </Card>

      {error && (
        <Card className="mb-6 border-amber-200 dark:border-amber-900">
          <CardBody className="text-sm text-amber-700 dark:text-amber-400">
            {error} — is the CreatorForge API running? See <code>backend/README.md</code>.
          </CardBody>
        </Card>
      )}

      {loading ? (
        <p className="py-8 text-center text-sm text-zinc-400">Loading projects...</p>
      ) : projects.length === 0 ? (
        <Card className="mb-6">
          <CardBody className="flex flex-col items-center gap-2 py-12 text-center">
            <Film className="h-8 w-8 text-zinc-300 dark:text-zinc-700" />
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              No projects yet. Create one above to start editing.
            </p>
          </CardBody>
        </Card>
      ) : (
        <div className="mb-6 space-y-3">
          {projects.map((p) => (
            <Card key={p.id}>
              <CardBody className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
                    <Film className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-white">{p.title}</p>
                    <p className="text-xs text-zinc-400">
                      Created {new Date(p.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge tone={statusTone[p.status]}>{p.status}</Badge>
                  <button
                    onClick={() => removeProject(p.id)}
                    className="rounded-md p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
                    aria-label="Delete project"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      <Card className="mb-6">
        <CardHeader>
          <h2 className="font-semibold text-zinc-900 dark:text-white">AI edit plan</h2>
        </CardHeader>
        <CardBody>
          <textarea
            value={footageNotes}
            onChange={(e) => setFootageNotes(e.target.value)}
            rows={8}
            placeholder="Describe your raw footage, or paste a timestamped transcript (e.g. '[00:00] intro... [00:45] umm, so today...'). Include timestamps if you have them, for a precise cut list."
            className="w-full resize-none rounded-lg border border-zinc-200 bg-transparent p-3 text-sm outline-none focus:border-brand-500 dark:border-zinc-700"
          />

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Target platforms (optional):</span>
            {PUBLISHING_PLATFORMS.map((platform) => (
              <button
                key={platform}
                type="button"
                onClick={() => togglePlatform(platform)}
                className={`rounded-full border px-2.5 py-1 text-xs font-medium transition ${
                  platforms.includes(platform)
                    ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-950/30 dark:text-brand-300"
                    : "border-zinc-200 text-zinc-500 dark:border-zinc-700 dark:text-zinc-400"
                }`}
              >
                {platform}
              </button>
            ))}
          </div>

          {planError && <p className="mt-3 text-sm text-red-600 dark:text-red-400">{planError}</p>}

          <div className="mt-3 flex justify-end">
            <Button onClick={handleGeneratePlan} disabled={planLoading} className="gap-2">
              {planLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Scissors className="h-4 w-4" />}
              {planLoading ? "Drafting plan..." : "Generate edit plan"}
            </Button>
          </div>
        </CardBody>
      </Card>

      {plan && (
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex items-center gap-2">
              <Scissors className="h-4 w-4 text-brand-600" />
              <h2 className="font-semibold text-zinc-900 dark:text-white">Cut list</h2>
            </CardHeader>
            <CardBody className="space-y-2">
              {plan.cut_list.length === 0 ? (
                <p className="text-sm text-zinc-400">No cuts suggested.</p>
              ) : (
                plan.cut_list.map((cut, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 rounded-lg bg-zinc-50 px-3 py-2 text-sm dark:bg-zinc-900"
                  >
                    <span className="flex shrink-0 items-center gap-1 font-medium text-zinc-500 dark:text-zinc-400">
                      <Clock className="h-3.5 w-3.5" />
                      {cut.timestamp_hint ?? "No timestamp"}
                    </span>
                    <span className="text-zinc-700 dark:text-zinc-300">{cut.reason}</span>
                  </div>
                ))
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-brand-600" />
              <h2 className="font-semibold text-zinc-900 dark:text-white">Scene plan</h2>
            </CardHeader>
            <CardBody className="space-y-2">
              {plan.scene_plan.map((scene, i) => (
                <div key={i} className="flex gap-3 text-sm">
                  <span className="shrink-0 font-medium text-zinc-900 dark:text-white">{i + 1}. {scene.label}</span>
                  <span className="text-zinc-500 dark:text-zinc-400">{scene.description}</span>
                </div>
              ))}
            </CardBody>
          </Card>

          {plan.platform_notes.length > 0 && (
            <Card>
              <CardHeader className="flex items-center gap-2">
                <MonitorSmartphone className="h-4 w-4 text-brand-600" />
                <h2 className="font-semibold text-zinc-900 dark:text-white">Platform notes</h2>
              </CardHeader>
              <CardBody className="space-y-2">
                {plan.platform_notes.map((note, i) => (
                  <div key={i} className="flex gap-3 text-sm">
                    <Badge>{note.platform}</Badge>
                    <span className="text-zinc-600 dark:text-zinc-300">{note.note}</span>
                  </div>
                ))}
              </CardBody>
            </Card>
          )}

          <Card>
            <CardHeader>
              <h2 className="font-semibold text-zinc-900 dark:text-white">Overall guidance</h2>
            </CardHeader>
            <CardBody>
              <p className="text-sm text-zinc-700 dark:text-zinc-300">{plan.overall_notes}</p>
            </CardBody>
          </Card>

          <p className="text-xs text-zinc-400">
            This is an AI-drafted plan based on your description, for you to apply in your own editor — not an
            automated video edit. CreatorForge doesn&apos;t process the actual video or audio.
          </p>
        </div>
      )}
    </div>
  );
}
