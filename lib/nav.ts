import {
  LayoutDashboard,
  Film,
  Image as ImageIcon,
  FileText,
  Search,
  Captions,
  Scissors,
  Send,
  BarChart3,
  Compass,
  Palette,
  Music,
  CalendarDays,
  Lightbulb,
  MessageSquare,
  Handshake,
  Wallet,
  HardDrive,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  group: string;
}

export const navItems: NavItem[] = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard, group: "General" },
  { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3, group: "General" },
  { label: "Growth Coach", href: "/dashboard/growth-coach", icon: Compass, group: "General" },

  { label: "Video Editor", href: "/dashboard/editor", icon: Film, group: "Create" },
  { label: "Thumbnails", href: "/dashboard/thumbnails", icon: ImageIcon, group: "Create" },
  { label: "Script Assistant", href: "/dashboard/scripts", icon: FileText, group: "Create" },
  { label: "Captions", href: "/dashboard/captions", icon: Captions, group: "Create" },
  { label: "Clip Generator", href: "/dashboard/clips", icon: Scissors, group: "Create" },
  { label: "Audio Studio", href: "/dashboard/audio-studio", icon: Music, group: "Create" },

  { label: "SEO Engine", href: "/dashboard/seo", icon: Search, group: "Grow" },
  { label: "Publishing Hub", href: "/dashboard/publishing", icon: Send, group: "Grow" },
  { label: "Content Calendar", href: "/dashboard/content-calendar", icon: CalendarDays, group: "Grow" },
  { label: "Idea Vault", href: "/dashboard/idea-vault", icon: Lightbulb, group: "Grow" },
  { label: "Comment Manager", href: "/dashboard/comments", icon: MessageSquare, group: "Grow" },

  { label: "Sponsor Manager", href: "/dashboard/sponsors", icon: Handshake, group: "Business" },
  { label: "Revenue", href: "/dashboard/revenue", icon: Wallet, group: "Business" },
  { label: "Brand Kit", href: "/dashboard/brand-kit", icon: Palette, group: "Business" },
  { label: "Cloud Storage", href: "/dashboard/storage", icon: HardDrive, group: "Business" },

  { label: "Settings", href: "/dashboard/settings", icon: Settings, group: "Account" },
];

export const navGroups = ["General", "Create", "Grow", "Business", "Account"] as const;
