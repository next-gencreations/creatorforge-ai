"use client";

import { useEffect, useState } from "react";
import { Handshake, FileText, Plus, Trash2, Loader2, Copy, Check } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { api, ApiError, SPONSOR_STATUSES, type Sponsor, type SponsorReport } from "@/lib/api";

function formatCurrency(amount: number) {
  return amount.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

export default function SponsorsPage() {
  const [sponsors, setSponsors] = useState<Sponsor[] | null>(null);
  const [name, setName] = useState("");
  const [deliverable, setDeliverable] = useState("");
  const [deadline, setDeadline] = useState("");
  const [amount, setAmount] = useState("");
  const [adding, setAdding] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [report, setReport] = useState<SponsorReport | null>(null);
  const [reportError, setReportError] = useState<string | null>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function load() {
    try {
      setSponsors(await api.listSponsors());
    } catch {
      setSponsors([]);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !deliverable.trim()) {
      setFormError("Sponsor name and deliverable are required.");
      return;
    }
    setAdding(true);
    setFormError(null);
    try {
      await api.createSponsor({
        name: name.trim(),
        deliverable: deliverable.trim(),
        deadline: deadline || undefined,
        amount: amount ? Number(amount) : 0,
      });
      setName("");
      setDeliverable("");
      setDeadline("");
      setAmount("");
      await load();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Could not reach the CreatorForge API.");
    } finally {
      setAdding(false);
    }
  }

  async function handleStatusChange(id: number, status: string) {
    const updated = await api.updateSponsor(id, { status });
    setSponsors((prev) => (prev ? prev.map((s) => (s.id === id ? updated : s)) : prev));
  }

  async function handleDelete(id: number) {
    await api.deleteSponsor(id);
    setSponsors((prev) => (prev ? prev.filter((s) => s.id !== id) : prev));
  }

  async function handleGenerateReport() {
    setReportLoading(true);
    setReportError(null);
    try {
      setReport(await api.generateSponsorReport());
    } catch (err) {
      setReportError(err instanceof ApiError ? err.message : "Could not reach the CreatorForge API.");
    } finally {
      setReportLoading(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Sponsor Manager"
        description="Track sponsor deals, deadlines and payments — then generate a real report from your data."
        action={
          <Button onClick={handleGenerateReport} disabled={reportLoading} className="gap-2">
            {reportLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
            {reportLoading ? "Generating..." : "Generate report"}
          </Button>
        }
      />

      <Card className="mb-6">
        <CardHeader>
          <h2 className="font-semibold text-zinc-900 dark:text-white">Add a sponsor deal</h2>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleAdd} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Sponsor name"
              className="rounded-lg border border-zinc-200 bg-transparent px-3 py-2.5 text-sm outline-none focus:border-brand-500 dark:border-zinc-700"
            />
            <input
              value={deliverable}
              onChange={(e) => setDeliverable(e.target.value)}
              placeholder="Deliverable, e.g. '60s integration'"
              className="rounded-lg border border-zinc-200 bg-transparent px-3 py-2.5 text-sm outline-none focus:border-brand-500 dark:border-zinc-700"
            />
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="rounded-lg border border-zinc-200 bg-transparent px-3 py-2.5 text-sm outline-none focus:border-brand-500 dark:border-zinc-700"
            />
            <div className="flex gap-2">
              <input
                type="number"
                min={0}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Amount ($)"
                className="w-full rounded-lg border border-zinc-200 bg-transparent px-3 py-2.5 text-sm outline-none focus:border-brand-500 dark:border-zinc-700"
              />
              <Button type="submit" disabled={adding} className="shrink-0 gap-1.5">
                {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              </Button>
            </div>
          </form>
          {formError && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{formError}</p>}
        </CardBody>
      </Card>

      {reportError && (
        <Card className="mb-6 border-amber-200 dark:border-amber-900">
          <CardBody className="text-sm text-amber-700 dark:text-amber-400">{reportError}</CardBody>
        </Card>
      )}

      {report && (
        <Card className="mb-6">
          <CardHeader className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-zinc-900 dark:text-white">Sponsorship report</h2>
              <p className="text-xs text-zinc-400">Total confirmed value: {formatCurrency(report.total_value)}</p>
            </div>
            <button
              onClick={async () => {
                await navigator.clipboard.writeText(report.report);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
              className="flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied" : "Copy"}
            </button>
          </CardHeader>
          <CardBody>
            <p className="whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300">{report.report}</p>
          </CardBody>
        </Card>
      )}

      {sponsors === null ? (
        <p className="py-8 text-center text-sm text-zinc-400">Loading sponsors...</p>
      ) : sponsors.length === 0 ? (
        <Card>
          <CardBody className="flex flex-col items-center gap-2 py-12 text-center">
            <Handshake className="h-8 w-8 text-zinc-300 dark:text-zinc-700" />
            <p className="text-sm text-zinc-500 dark:text-zinc-400">No sponsor deals yet — add one above.</p>
          </CardBody>
        </Card>
      ) : (
        <Card>
          <CardBody className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-100 text-left text-zinc-400 dark:border-zinc-800">
                  <th className="px-5 py-3 font-medium">Sponsor</th>
                  <th className="px-5 py-3 font-medium">Deliverable</th>
                  <th className="px-5 py-3 font-medium">Deadline</th>
                  <th className="px-5 py-3 font-medium">Amount</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {sponsors.map((s) => (
                  <tr key={s.id} className="border-b border-zinc-50 last:border-0 dark:border-zinc-900">
                    <td className="flex items-center gap-2 px-5 py-3 font-medium text-zinc-900 dark:text-white">
                      <Handshake className="h-4 w-4 text-brand-600" /> {s.name}
                    </td>
                    <td className="px-5 py-3 text-zinc-500 dark:text-zinc-400">{s.deliverable}</td>
                    <td className="px-5 py-3 text-zinc-500 dark:text-zinc-400">{s.deadline ?? "—"}</td>
                    <td className="px-5 py-3 text-zinc-500 dark:text-zinc-400">{formatCurrency(s.amount)}</td>
                    <td className="px-5 py-3">
                      <select
                        value={s.status}
                        onChange={(e) => handleStatusChange(s.id, e.target.value)}
                        className="rounded-full border-0 bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-700 outline-none dark:bg-zinc-800 dark:text-zinc-300"
                      >
                        {SPONSOR_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => handleDelete(s.id)}
                        className="rounded-md p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
                        aria-label="Delete sponsor"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
