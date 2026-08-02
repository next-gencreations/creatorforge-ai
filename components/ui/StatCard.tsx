import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Card } from "./Card";

export function StatCard({
  label,
  value,
  delta,
  trend,
}: {
  label: string;
  value: string;
  delta?: string;
  trend?: "up" | "down";
}) {
  return (
    <Card className="p-5">
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{label}</p>
      <div className="mt-2 flex items-baseline justify-between">
        <p className="text-2xl font-bold text-zinc-900 dark:text-white">{value}</p>
        {delta && (
          <span
            className={`flex items-center gap-0.5 text-xs font-medium ${
              trend === "up" ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
            }`}
          >
            {trend === "up" ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
            {delta}
          </span>
        )}
      </div>
    </Card>
  );
}
