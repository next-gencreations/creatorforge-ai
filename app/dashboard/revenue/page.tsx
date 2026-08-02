"use client";

import { useEffect, useState } from "react";
import { Wallet, FileText, Plus, Trash2, Loader2, Copy, Check } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { Button } from "@/components/ui/Button";
import { api, ApiError, INCOME_SOURCES, type IncomeEntry, type RevenueSummary, type RevenueReport } from "@/lib/api";

function formatCurrency(amount: number) {
  return amount.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });
}

export default function RevenuePage() {
  const [summary, setSummary] = useState<RevenueSummary | null>(null);
  const [entries, setEntries] = useState<IncomeEntry[] | null>(null);

  const [source, setSource] = useState<string>(INCOME_SOURCES[0]);
  const [amount, setAmount] = useState("");
  const [entryDate, setEntryDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState("");
  const [adding, setAdding] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [report, setReport] = useState<RevenueReport | null>(null);
  const [reportError, setReportError] = useState<string | null>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function load() {
    try {
      const [s, e] = await Promise.all([api.getRevenueSummary(), api.listIncome()]);
      setSummary(s);
      setEntries(e);
    } catch {
      setSummary({ streams: [], total: 0 });
      setEntries([]);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const value = Number(amount);
    if (!value || value <= 0) {
      setFormError("Enter an amount greater than 0.");
      return;
    }
    if (!entryDate) {
      setFormError("Pick a date for this income entry.");
      return;
    }
    setAdding(true);
    setFormError(null);
    try {
      await api.createIncome({ source, amount: value, entry_date: entryDate, note: note.trim() || undefined });
      setAmount("");
      setNote("");
      await load();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Could not reach the CreatorForge API.");
    } finally {
      setAdding(false);
    }
  }

  async function handleDelete(id: number) {
    await api.deleteIncome(id);
    await load();
  }

  async function handleGenerateReport() {
    setReportLoading(true);
    setReportError(null);
    try {
      setReport(await api.generateRevenueReport());
    } catch (err) {
      setReportError(err instanceof ApiError ? err.message : "Could not reach the CreatorForge API.");
    } finally {
      setReportLoading(false);
    }
  }

  const streams = summary?.streams ?? [];
  const total = summary?.total ?? 0;
  const topStream = streams[0];

  return (
    <div>
      <PageHeader
        title="Revenue Dashboard"
        description="Track income across every source in one financial view."
        action={
          <Button onClick={handleGenerateReport} disabled={reportLoading} className="gap-2">
            {reportLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
            {reportLoading ? "Generating..." : "Generate report"}
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Total income" value={formatCurrency(total)} />
        <StatCard label="Top source" value={topStream ? topStream.source : "—"} />
        <StatCard
          label="Top source share"
          value={topStream && total > 0 ? `${Math.round((topStream.amount / total) * 100)}%` : "—"}
        />
      </div>

      <Card className="mt-6 mb-6">
        <CardHeader>
          <h2 className="font-semibold text-zinc-900 dark:text-white">Log income</h2>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleAdd} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="rounded-lg border border-zinc-200 bg-transparent px-3 py-2.5 text-sm outline-none focus:border-brand-500 dark:border-zinc-700"
            >
              {INCOME_SOURCES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <input
              type="number"
              min={0}
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Amount ($)"
              className="rounded-lg border border-zinc-200 bg-transparent px-3 py-2.5 text-sm outline-none focus:border-brand-500 dark:border-zinc-700"
            />
            <input
              type="date"
              value={entryDate}
              onChange={(e) => setEntryDate(e.target.value)}
              className="rounded-lg border border-zinc-200 bg-transparent px-3 py-2.5 text-sm outline-none focus:border-brand-500 dark:border-zinc-700"
            />
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Note (optional)"
              className="rounded-lg border border-zinc-200 bg-transparent px-3 py-2.5 text-sm outline-none focus:border-brand-500 dark:border-zinc-700"
            />
            <Button type="submit" disabled={adding} className="gap-1.5">
              {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Add
            </Button>
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
            <h2 className="font-semibold text-zinc-900 dark:text-white">Revenue report</h2>
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

      <Card className="mb-6">
        <CardHeader className="flex items-center gap-2">
          <Wallet className="h-4 w-4 text-brand-600" />
          <h2 className="font-semibold text-zinc-900 dark:text-white">Income by source</h2>
        </CardHeader>
        <CardBody className="space-y-4">
          {streams.length === 0 ? (
            <p className="py-4 text-center text-sm text-zinc-400">No income logged yet — add an entry above.</p>
          ) : (
            streams.map((s) => (
              <div key={s.source}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium text-zinc-700 dark:text-zinc-300">{s.source}</span>
                  <span className="text-zinc-500 dark:text-zinc-400">{formatCurrency(s.amount)}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-zinc-100 dark:bg-zinc-800">
                  <div
                    className="h-2 rounded-full bg-brand-500"
                    style={{ width: `${total > 0 ? (s.amount / total) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))
          )}
          <p className="pt-1 text-xs text-zinc-400">
            The &quot;Sponsorships&quot; stream is computed automatically from your Paid sponsor deals.
          </p>
        </CardBody>
      </Card>

      {entries === null ? (
        <p className="py-8 text-center text-sm text-zinc-400">Loading income entries...</p>
      ) : entries.length === 0 ? null : (
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-zinc-900 dark:text-white">Income entries</h2>
          </CardHeader>
          <CardBody className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-100 text-left text-zinc-400 dark:border-zinc-800">
                  <th className="px-5 py-3 font-medium">Source</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Amount</th>
                  <th className="px-5 py-3 font-medium">Note</th>
                  <th className="px-5 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr key={entry.id} className="border-b border-zinc-50 last:border-0 dark:border-zinc-900">
                    <td className="px-5 py-3 font-medium text-zinc-900 dark:text-white">{entry.source}</td>
                    <td className="px-5 py-3 text-zinc-500 dark:text-zinc-400">{entry.entry_date}</td>
                    <td className="px-5 py-3 text-zinc-500 dark:text-zinc-400">{formatCurrency(entry.amount)}</td>
                    <td className="px-5 py-3 text-zinc-500 dark:text-zinc-400">{entry.note ?? "—"}</td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => handleDelete(entry.id)}
                        className="rounded-md p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
                        aria-label="Delete income entry"
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
