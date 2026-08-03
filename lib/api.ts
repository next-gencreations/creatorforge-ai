const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("cf_token");
}

export function setToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) window.localStorage.setItem("cf_token", token);
  else window.localStorage.removeItem("cf_token");
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = body.detail || detail;
    } catch {
      // ignore
    }
    throw new ApiError(detail, res.status);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export interface User {
  id: number;
  email: string;
  full_name: string;
  channel_name: string | null;
  created_at: string;
}

export interface Project {
  id: number;
  title: string;
  status: "draft" | "processing" | "ready" | "published";
  platform_targets: string[];
  duration_seconds: number | null;
  created_at: string;
  updated_at: string;
}

export type ScriptMode = "script" | "hook" | "storytelling" | "cta";

export interface ThumbnailAnalysis {
  ctr_score: number;
  score_rationale: string;
  feedback: string[];
  title_suggestions: string[];
}

export interface SeoMetadata {
  title: string;
  description: string;
  tags: string[];
  hashtags: string[];
  chapters: string[];
  keyword_focus: string[];
  assessment: string;
}

export interface CaptionCue {
  index: number;
  start: number;
  end: number;
  text: string;
}

export interface CaptionResult {
  cues: CaptionCue[];
  srt: string;
}

export interface ClipCandidate {
  quote: string;
  timestamp_hint: string | null;
  reason: string;
  suggested_title: string;
  platform_caption: string;
  score: number;
}

export const PUBLISHING_PLATFORMS = [
  "YouTube", "TikTok", "Instagram", "Facebook", "X", "LinkedIn", "Pinterest", "Twitch",
] as const;

export interface PlatformVersion {
  platform: string;
  text: string;
  notes: string;
}

export interface GrowthCoachAdvice {
  diagnosis: string;
  content_ideas: string[];
  priorities: string[];
  upload_timing_tip: string;
}

export const IDEA_SOURCES = [
  "Note", "Voice Memo", "Reddit", "Trending Search", "Comment", "News", "RSS Feed", "Other",
] as const;

export interface Idea {
  id: number;
  source: string;
  content: string;
  created_at: string;
}

export interface CommentResult {
  sentiment: "positive" | "neutral" | "negative";
  is_spam: boolean;
  suggested_reply: string | null;
}

export const SPONSOR_STATUSES = ["Prospecting", "Contract sent", "In progress", "Delivered", "Paid"] as const;

export interface Sponsor {
  id: number;
  name: string;
  deliverable: string;
  deadline: string | null;
  amount: number;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface SponsorReport {
  report: string;
  total_value: number;
}

export const INCOME_SOURCES = ["YouTube Ad Revenue", "Merchandise", "Affiliate Sales", "Patreon", "Donations", "Other"] as const;

export interface IncomeEntry {
  id: number;
  source: string;
  amount: number;
  entry_date: string;
  note: string | null;
  created_at: string;
}

export interface RevenueStream {
  source: string;
  amount: number;
}

export interface RevenueSummary {
  streams: RevenueStream[];
  total: number;
}

export interface RevenueReport {
  report: string;
}

export const MAX_STORAGE_UPLOAD_BYTES = 25 * 1024 * 1024;

export interface StorageFile {
  id: number;
  filename: string;
  folder: string;
  content_type: string;
  size_bytes: number;
  created_at: string;
}

export interface StorageFolderSummary {
  folder: string;
  item_count: number;
  total_bytes: number;
}

export interface StorageSummary {
  folders: StorageFolderSummary[];
  used_bytes: number;
  quota_bytes: number;
}

export const VOICE_CHOICES = ["Rachel", "Adam", "Bella", "Antoni"] as const;

export interface CutSuggestion {
  timestamp_hint: string | null;
  reason: string;
}

export interface SceneStep {
  label: string;
  description: string;
}

export interface PlatformEditNote {
  platform: string;
  note: string;
}

export interface EditPlan {
  cut_list: CutSuggestion[];
  scene_plan: SceneStep[];
  platform_notes: PlatformEditNote[];
  overall_notes: string;
}

export const api = {
  register: (data: { email: string; password: string; full_name: string; channel_name?: string }) =>
    request<{ access_token: string; token_type: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  login: (data: { email: string; password: string }) =>
    request<{ access_token: string; token_type: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  me: () => request<User>("/auth/me"),
  listProjects: () => request<Project[]>("/projects"),
  createProject: (data: { title: string; platform_targets?: string[] }) =>
    request<Project>("/projects", { method: "POST", body: JSON.stringify(data) }),
  updateProject: (id: number, data: Partial<Pick<Project, "title" | "status" | "platform_targets">>) =>
    request<Project>(`/projects/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteProject: (id: number) => request<void>(`/projects/${id}`, { method: "DELETE" }),
  generateScript: (data: { mode: ScriptMode; prompt: string; template?: string }) =>
    request<{ content: string }>("/scripts/generate", { method: "POST", body: JSON.stringify(data) }),
  analyzeThumbnail: (data: { image_data: string; media_type: string; video_topic?: string }) =>
    request<ThumbnailAnalysis>("/thumbnails/analyze", { method: "POST", body: JSON.stringify(data) }),
  generateSeo: (data: { topic: string; existing_title?: string }) =>
    request<SeoMetadata>("/seo/generate", { method: "POST", body: JSON.stringify(data) }),
  generateCaptions: (data: { transcript: string; language?: string; emoji?: boolean }) =>
    request<CaptionResult>("/captions/generate", { method: "POST", body: JSON.stringify(data) }),
  generateClips: (data: { transcript: string }) =>
    request<{ clips: ClipCandidate[] }>("/clips/generate", { method: "POST", body: JSON.stringify(data) }),
  optimizeForPlatforms: (data: { content: string; platforms: string[] }) =>
    request<{ versions: PlatformVersion[] }>("/publishing/optimize", { method: "POST", body: JSON.stringify(data) }),
  getGrowthCoachAdvice: (data: { context: string }) =>
    request<GrowthCoachAdvice>("/growth-coach/advise", { method: "POST", body: JSON.stringify(data) }),
  listIdeas: () => request<Idea[]>("/ideas"),
  createIdea: (data: { source: string; content: string }) =>
    request<Idea>("/ideas", { method: "POST", body: JSON.stringify(data) }),
  deleteIdea: (id: number) => request<void>(`/ideas/${id}`, { method: "DELETE" }),
  moderateComments: (data: { comments: string[] }) =>
    request<{ results: CommentResult[] }>("/comments/moderate", { method: "POST", body: JSON.stringify(data) }),
  listSponsors: () => request<Sponsor[]>("/sponsors"),
  createSponsor: (data: { name: string; deliverable: string; deadline?: string; amount?: number; status?: string }) =>
    request<Sponsor>("/sponsors", { method: "POST", body: JSON.stringify(data) }),
  updateSponsor: (id: number, data: Partial<Pick<Sponsor, "status" | "amount" | "deadline">>) =>
    request<Sponsor>(`/sponsors/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteSponsor: (id: number) => request<void>(`/sponsors/${id}`, { method: "DELETE" }),
  generateSponsorReport: () => request<SponsorReport>("/sponsors/report", { method: "POST" }),
  listIncome: () => request<IncomeEntry[]>("/income"),
  createIncome: (data: { source: string; amount: number; entry_date: string; note?: string }) =>
    request<IncomeEntry>("/income", { method: "POST", body: JSON.stringify(data) }),
  deleteIncome: (id: number) => request<void>(`/income/${id}`, { method: "DELETE" }),
  getRevenueSummary: () => request<RevenueSummary>("/revenue/summary"),
  generateRevenueReport: () => request<RevenueReport>("/revenue/report", { method: "POST" }),
  listStorageFiles: () => request<StorageFile[]>("/storage/files"),
  uploadStorageFile: (data: { filename: string; content_type: string; folder?: string; file_data: string }) =>
    request<StorageFile>("/storage/files", { method: "POST", body: JSON.stringify(data) }),
  deleteStorageFile: (id: number) => request<void>(`/storage/files/${id}`, { method: "DELETE" }),
  getStorageSummary: () => request<StorageSummary>("/storage/summary"),
  fetchStorageFileBlob: async (id: number): Promise<Blob> => {
    const token = getToken();
    const res = await fetch(`${API_URL}/storage/files/${id}/download`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) throw new ApiError("Could not load this file.", res.status);
    return res.blob();
  },
  downloadStorageFile: async (id: number, filename: string) => {
    const blob = await api.fetchStorageFileBlob(id);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  },
  generateEditPlan: (data: { footage_notes: string; platform_targets?: string[] }) =>
    request<EditPlan>("/editor/plan", { method: "POST", body: JSON.stringify(data) }),
  generateVoiceover: (data: { script: string; voice?: string }) =>
    request<StorageFile>("/audio/voiceover", { method: "POST", body: JSON.stringify(data) }),
};

export { API_URL };
