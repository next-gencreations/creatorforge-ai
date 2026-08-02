"use client";

import { useEffect, useRef, useState } from "react";
import { HardDrive, Folder, Upload, Trash2, Download, Loader2, File as FileIcon } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  api,
  ApiError,
  MAX_STORAGE_UPLOAD_BYTES,
  type StorageFile,
  type StorageSummary,
} from "@/lib/api";

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1] ?? "");
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export default function StoragePage() {
  const [summary, setSummary] = useState<StorageSummary | null>(null);
  const [files, setFiles] = useState<StorageFile[] | null>(null);
  const [folder, setFolder] = useState("Uncategorized");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [activeFolder, setActiveFolder] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function load() {
    try {
      const [s, f] = await Promise.all([api.getStorageSummary(), api.listStorageFiles()]);
      setSummary(s);
      setFiles(f);
    } catch {
      setSummary({ folders: [], used_bytes: 0, quota_bytes: 0 });
      setFiles([]);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    if (file.size > MAX_STORAGE_UPLOAD_BYTES) {
      setUploadError(`"${file.name}" exceeds the ${formatBytes(MAX_STORAGE_UPLOAD_BYTES)} upload limit.`);
      return;
    }

    setUploading(true);
    setUploadError(null);
    try {
      const file_data = await fileToBase64(file);
      await api.uploadStorageFile({
        filename: file.name,
        content_type: file.type || "application/octet-stream",
        folder: folder.trim() || "Uncategorized",
        file_data,
      });
      await load();
    } catch (err) {
      setUploadError(err instanceof ApiError ? err.message : "Could not reach the CreatorForge API.");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id: number) {
    await api.deleteStorageFile(id);
    await load();
  }

  async function handleDownload(f: StorageFile) {
    try {
      await api.downloadStorageFile(f.id, f.filename);
    } catch (err) {
      setUploadError(err instanceof ApiError ? err.message : "Could not download this file.");
    }
  }

  const folders = summary?.folders ?? [];
  const usedBytes = summary?.used_bytes ?? 0;
  const quotaBytes = summary?.quota_bytes ?? 0;
  const percentUsed = quotaBytes > 0 ? Math.min(100, (usedBytes / quotaBytes) * 100) : 0;
  const visibleFiles = files?.filter((f) => !activeFolder || f.folder === activeFolder) ?? [];

  return (
    <div>
      <PageHeader
        title="Cloud Storage"
        description="Your creator workspace — real files, uploaded and stored on the CreatorForge server."
        action={
          <div className="flex items-center gap-2">
            <input
              value={folder}
              onChange={(e) => setFolder(e.target.value)}
              placeholder="Folder"
              className="w-32 rounded-lg border border-zinc-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-zinc-700"
            />
            <Button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="gap-2">
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              {uploading ? "Uploading..." : "Upload file"}
            </Button>
            <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileSelected} />
          </div>
        }
      />

      {uploadError && (
        <Card className="mb-6 border-amber-200 dark:border-amber-900">
          <CardBody className="text-sm text-amber-700 dark:text-amber-400">{uploadError}</CardBody>
        </Card>
      )}

      <Card className="mb-6">
        <CardBody className="flex items-center gap-4">
          <HardDrive className="h-8 w-8 text-brand-600" />
          <div className="flex-1">
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="font-medium text-zinc-700 dark:text-zinc-300">
                {formatBytes(usedBytes)} of {formatBytes(quotaBytes)} used
              </span>
              <span className="text-zinc-400">{Math.round(percentUsed)}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-zinc-100 dark:bg-zinc-800">
              <div className="h-2 rounded-full bg-brand-500" style={{ width: `${percentUsed}%` }} />
            </div>
          </div>
        </CardBody>
      </Card>

      {folders.length > 0 && (
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <button
            onClick={() => setActiveFolder(null)}
            className={`rounded-2xl border p-4 text-left transition ${
              activeFolder === null
                ? "border-brand-500 bg-brand-50 dark:bg-brand-950/30"
                : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
            }`}
          >
            <div className="flex items-center gap-3">
              <Folder className="h-5 w-5 text-brand-600" />
              <div>
                <p className="text-sm font-medium text-zinc-900 dark:text-white">All files</p>
                <p className="text-xs text-zinc-400">
                  {files?.length ?? 0} items · {formatBytes(usedBytes)}
                </p>
              </div>
            </div>
          </button>
          {folders.map((f) => (
            <button
              key={f.folder}
              onClick={() => setActiveFolder(f.folder)}
              className={`rounded-2xl border p-4 text-left transition ${
                activeFolder === f.folder
                  ? "border-brand-500 bg-brand-50 dark:bg-brand-950/30"
                  : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
              }`}
            >
              <div className="flex items-center gap-3">
                <Folder className="h-5 w-5 text-brand-600" />
                <div>
                  <p className="text-sm font-medium text-zinc-900 dark:text-white">{f.folder}</p>
                  <p className="text-xs text-zinc-400">
                    {f.item_count} items · {formatBytes(f.total_bytes)}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {files === null ? (
        <p className="py-8 text-center text-sm text-zinc-400">Loading files...</p>
      ) : visibleFiles.length === 0 ? (
        <Card>
          <CardBody className="flex flex-col items-center gap-2 py-12 text-center">
            <HardDrive className="h-8 w-8 text-zinc-300 dark:text-zinc-700" />
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {files.length === 0 ? "No files uploaded yet — upload one above." : "No files in this folder."}
            </p>
          </CardBody>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-zinc-900 dark:text-white">Files</h2>
          </CardHeader>
          <CardBody className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-100 text-left text-zinc-400 dark:border-zinc-800">
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Folder</th>
                  <th className="px-5 py-3 font-medium">Size</th>
                  <th className="px-5 py-3 font-medium">Uploaded</th>
                  <th className="px-5 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {visibleFiles.map((f) => (
                  <tr key={f.id} className="border-b border-zinc-50 last:border-0 dark:border-zinc-900">
                    <td className="flex items-center gap-2 px-5 py-3 font-medium text-zinc-900 dark:text-white">
                      <FileIcon className="h-4 w-4 text-brand-600" /> {f.filename}
                    </td>
                    <td className="px-5 py-3 text-zinc-500 dark:text-zinc-400">{f.folder}</td>
                    <td className="px-5 py-3 text-zinc-500 dark:text-zinc-400">{formatBytes(f.size_bytes)}</td>
                    <td className="px-5 py-3 text-zinc-500 dark:text-zinc-400">
                      {new Date(f.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => handleDownload(f)}
                          className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-brand-600 dark:hover:bg-zinc-800"
                          aria-label="Download file"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(f.id)}
                          className="rounded-md p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
                          aria-label="Delete file"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
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
