"use client";

import { GithubIcon, LinkedinIcon } from "@animateicons/react/lucide";
import { ComponentType, RefAttributes, useRef } from "react";

import { cn } from "@/lib/utils";

type AnimatedIconHandle = { startAnimation: () => void; stopAnimation: () => void };
type AnimatedIcon = ComponentType<
    { size?: number; duration?: number; color?: string; className?: string; isAnimated?: boolean } & RefAttributes<AnimatedIconHandle>
>;

const links: Array<{ label: string; href: string; icon: AnimatedIcon; gradient: string; glow: string }> = [
    {
        label: "GitHub",
        href: "https://github.com/d3byn",
        icon: GithubIcon as AnimatedIcon,
        gradient: "bg-[linear-gradient(135deg,#6E7681,#1F2328)]",
        glow: "shadow-slate-700/40",
    },
    {
        label: "LinkedIn",
        href: "https://www.linkedin.com/in/d3bayansarkar/",
        icon: LinkedinIcon as AnimatedIcon,
        gradient: "bg-[linear-gradient(135deg,#38BDF8,#0A66C2)]",
        glow: "shadow-sky-500/40",
    },
];

function SocialLink({ label, href, icon: Icon, gradient, glow }: (typeof links)[number]) {
    const iconRef = useRef<AnimatedIconHandle>(null);

    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${label} (opens in a new tab)`}
            title={label}
            onMouseEnter={() => iconRef.current?.startAnimation()}
            onMouseLeave={() => iconRef.current?.stopAnimation()}
            onFocus={() => iconRef.current?.startAnimation()}
            onBlur={() => iconRef.current?.stopAnimation()}
            className={cn(
                "flex size-9 items-center justify-center rounded-xl shadow-md transition-transform duration-200 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                gradient,
                glow,
            )}
        >
            <Icon ref={iconRef} size={18} duration={1} color="#ffffff" isAnimated />
        </a>
    );
}

export function SocialLinks() {
    return (
        <div className="flex items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">Connect</span>
            <div className="flex items-center gap-2">
                {links.map((link) => (
                    <SocialLink key={link.label} {...link} />
                ))}
            </div>
        </div>
    );
}
