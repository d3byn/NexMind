import {
    BookOpenTextIcon,
    CalendarCheckIcon,
    CircleCheckBigIcon,
    ClipboardIcon,
    CpuIcon,
    FolderOpenIcon,
    HouseIcon,
    LayoutDashboardIcon,
    SettingsIcon,
} from "@animateicons/react/lucide";

import type { AnimatedIcon } from "@/components/page-icon";

export const pageIcons = {
    dashboard: {
        icon: HouseIcon as AnimatedIcon,
        gradient: "bg-[linear-gradient(135deg,#818CF8,#4F46E5)]",
        glow: "shadow-indigo-500/40",
    },
    "ai-assistant": {
        icon: CpuIcon as AnimatedIcon,
        gradient: "bg-[linear-gradient(135deg,#C084FC,#7C3AED)]",
        glow: "shadow-purple-500/40",
    },
    calendar: {
        icon: CalendarCheckIcon as AnimatedIcon,
        gradient: "bg-[linear-gradient(135deg,#34D399,#059669)]",
        glow: "shadow-emerald-500/40",
    },
    kanban: {
        icon: CircleCheckBigIcon as AnimatedIcon,
        gradient: "bg-[linear-gradient(135deg,#FBBF24,#D97706)]",
        glow: "shadow-amber-500/40",
    },
    notes: {
        icon: BookOpenTextIcon as AnimatedIcon,
        gradient: "bg-[linear-gradient(135deg,#38BDF8,#0284C7)]",
        glow: "shadow-sky-500/40",
    },
    whiteboard: {
        icon: ClipboardIcon as AnimatedIcon,
        gradient: "bg-[linear-gradient(135deg,#FB7185,#E11D48)]",
        glow: "shadow-rose-500/40",
    },
    spaces: {
        icon: FolderOpenIcon as AnimatedIcon,
        gradient: "bg-[linear-gradient(135deg,#2DD4BF,#0D9488)]",
        glow: "shadow-teal-500/40",
    },
    "ai-template-builder": {
        icon: LayoutDashboardIcon as AnimatedIcon,
        gradient: "bg-[linear-gradient(135deg,#FB923C,#EA580C)]",
        glow: "shadow-orange-500/40",
    },
    settings: {
        icon: SettingsIcon as AnimatedIcon,
        gradient: "bg-[linear-gradient(135deg,#A5B4FC,#64748B)]",
        glow: "shadow-slate-500/40",
    },
} as const;
