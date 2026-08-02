"use client";

import { useEffect, useState } from "react";
import { Film, Plus, Trash2, Scissors, Wand2 } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { api, ApiError, type Project } from "@/lib/api";

const statusTone: Record<Project["status"], "default" | "success" | "warning" | "brand"> = {
  draft: "default",
  processing: "warning",
  ready: "brand",
  published: "success",
};

const editorTools = [
  { icon: Scissors, label: "Remove silence & filler words" },
  { icon: Wand2, label: "Auto crop for Shorts / TikTok / Reels" },
  { icon: Wand2, label: "Smart zooms & face tracking" },
  { icon: Wand2, label: "AI colour correction & lighting" },
  { icon: Wand2, label: "Background noise & wind removal" },
];

export default function EditorPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState("");

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

  return (
    <div>
      <PageHeader
        title="AI Video Editor"
        description="Drop in footage and let CreatorForge handle scene detection, cleanup, colour and framing."
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {loading ? (
            <p className="py-8 text-center text-sm text-zinc-400">Loading projects...</p>
          ) : projects.length === 0 ? (
            <Card>
              <CardBody className="flex flex-col items-center gap-2 py-12 text-center">
                <Film className="h-8 w-8 text-zinc-300 dark:text-zinc-700" />
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  No projects yet. Create one above to start editing.
                </p>
              </CardBody>
            </Card>
          ) : (
            <div className="space-y-3">
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
        </div>

        <Card>
          <CardBody>
            <h2 className="mb-4 font-semibold text-zinc-900 dark:text-white">AI edit pipeline</h2>
            <div className="space-y-3">
              {editorTools.map((tool) => (
                <div key={tool.label} className="flex items-center gap-3 text-sm text-zinc-600 dark:text-zinc-300">
                  <tool.icon className="h-4 w-4 shrink-0 text-brand-600" />
                  {tool.label}
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs text-zinc-400">
              The automated edit pipeline runs on upload once storage and processing workers are connected.
            </p>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
