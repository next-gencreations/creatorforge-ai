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
};

export { API_URL };
