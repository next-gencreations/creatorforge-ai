"use client";

import { Handshake, FileText } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { sponsors } from "@/lib/mock-data";

const statusTone = { "in progress": "brand", "contract sent": "warning", paid: "success" } as const;

export default function SponsorsPage() {
  return (
    <div>
      <PageHeader
        title="Sponsor Manager"
        description="Track sponsor contacts, contracts, deliverables and payments in one place."
        action={<Button className="gap-2"><FileText className="h-4 w-4" /> Generate report</Button>}
      />

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
              </tr>
            </thead>
            <tbody>
              {sponsors.map((s) => (
                <tr key={s.id} className="border-b border-zinc-50 last:border-0 dark:border-zinc-900">
                  <td className="flex items-center gap-2 px-5 py-3 font-medium text-zinc-900 dark:text-white">
                    <Handshake className="h-4 w-4 text-brand-600" /> {s.name}
                  </td>
                  <td className="px-5 py-3 text-zinc-500 dark:text-zinc-400">{s.deliverable}</td>
                  <td className="px-5 py-3 text-zinc-500 dark:text-zinc-400">{s.deadline}</td>
                  <td className="px-5 py-3 text-zinc-500 dark:text-zinc-400">{s.amount}</td>
                  <td className="px-5 py-3">
                    <Badge tone={statusTone[s.status as keyof typeof statusTone]}>{s.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardBody>
      </Card>
    </div>
  );
}
