// Placeholder data for feature areas not yet backed by a live pipeline.
// Replace with real API-driven data as each service comes online.

export const analyticsOverview = {
  views: { value: "482.3K", delta: "+12.4%", trend: "up" as const },
  subscribers: { value: "18,204", delta: "+3.1%", trend: "up" as const },
  watchTimeHours: { value: "36,910", delta: "+8.7%", trend: "up" as const },
  revenue: { value: "$9,842", delta: "-2.3%", trend: "down" as const },
};

export const uploadSchedule = [
  { day: "Mon", score: 62 },
  { day: "Tue", score: 74 },
  { day: "Wed", score: 88 },
  { day: "Thu", score: 95 },
  { day: "Fri", score: 81 },
  { day: "Sat", score: 58 },
  { day: "Sun", score: 47 },
];

export const scriptTemplates = [
  { id: 1, name: "Viral Hook Opener", description: "First 5 seconds designed to stop the scroll." },
  { id: 2, name: "Tutorial Structure", description: "Problem → demo → recap → CTA." },
  { id: 3, name: "Storytime Arc", description: "Setup, tension, twist, resolution." },
  { id: 4, name: "Sponsor Read", description: "Natural transition into a sponsor segment." },
];

export const calendarItems = [
  { date: "Aug 4", title: "Studio Tour Vlog", platform: "YouTube", status: "scheduled" },
  { date: "Aug 6", title: "Q&A Shorts Batch", platform: "Shorts", status: "draft" },
  { date: "Aug 8", title: "Sponsor: NordVPN", platform: "YouTube", status: "deadline" },
  { date: "Aug 11", title: "Behind the Scenes", platform: "Instagram", status: "scheduled" },
];

export const revenueStreams = [
  { source: "YouTube Ad Revenue", amount: 4820, change: "+6%" },
  { source: "Sponsorships", amount: 12800, change: "+18%" },
  { source: "Merchandise", amount: 1340, change: "-4%" },
  { source: "Affiliate Sales", amount: 960, change: "+2%" },
  { source: "Patreon", amount: 2210, change: "+11%" },
];

export const brandKitAssets = {
  colors: ["#6C3BFF", "#0F0F14", "#F2F0FF", "#FFB020"],
  fonts: ["Inter", "Poppins"],
  logos: ["primary-logo.svg", "watermark.svg"],
  templates: ["Intro v2", "Outro v1", "Sponsor Card"],
};

export const audioLibrary = [
  { id: 1, name: "Upbeat Intro Loop", type: "Intro Music", duration: "0:12" },
  { id: 2, name: "Ambient Background Bed", type: "Background Music", duration: "3:20" },
  { id: 3, name: "Whoosh Transition", type: "Sound Effect", duration: "0:02" },
  { id: 4, name: "Narrator Voiceover — Warm Male", type: "AI Voice", duration: "—" },
];
