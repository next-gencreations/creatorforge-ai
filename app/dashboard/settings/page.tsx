"use client";

import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { useAuth } from "@/lib/auth-context";

export default function SettingsPage() {
  const { user, logout } = useAuth();

  return (
    <div>
      <PageHeader title="Settings" description="Manage your account and workspace preferences." />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-zinc-900 dark:text-white">Account</h2>
          </CardHeader>
          <CardBody className="space-y-3 text-sm">
            <div className="flex justify-between border-b border-zinc-100 pb-3 dark:border-zinc-800">
              <span className="text-zinc-400">Full name</span>
              <span className="font-medium text-zinc-900 dark:text-white">{user?.full_name}</span>
            </div>
            <div className="flex justify-between border-b border-zinc-100 pb-3 dark:border-zinc-800">
              <span className="text-zinc-400">Email</span>
              <span className="font-medium text-zinc-900 dark:text-white">{user?.email}</span>
            </div>
            <div className="flex justify-between border-b border-zinc-100 pb-3 dark:border-zinc-800">
              <span className="text-zinc-400">Channel</span>
              <span className="font-medium text-zinc-900 dark:text-white">{user?.channel_name || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Member since</span>
              <span className="font-medium text-zinc-900 dark:text-white">
                {user ? new Date(user.created_at).toLocaleDateString() : "—"}
              </span>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="font-semibold text-zinc-900 dark:text-white">Session</h2>
          </CardHeader>
          <CardBody>
            <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
              Sign out of CreatorForge on this device.
            </p>
            <button
              onClick={logout}
              className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950"
            >
              Log out
            </button>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
