"use client";

import { ComponentType, RefAttributes, useRef } from "react";

import { cn } from "@/lib/utils";

type AnimatedIconHandle = { startAnimation: () => void; stopAnimation: () => void };

export type AnimatedIcon = ComponentType<
    { size?: number; duration?: number; color?: string; className?: string; isAnimated?: boolean } & RefAttributes<AnimatedIconHandle>
>;


export function PageIcon({
    icon: Icon,
    gradient,
    glow,
    size = "md",
    className,
}: {
    icon: AnimatedIcon;
    gradient: string;
    glow: string;
    size?: "sm" | "md";
    className?: string;
}) {
    const iconRef = useRef<AnimatedIconHandle>(null);

    return (
        <span
            onMouseEnter={() => iconRef.current?.startAnimation()}
            onMouseLeave={() => iconRef.current?.stopAnimation()}
            className={cn(
                "flex shrink-0 items-center justify-center rounded-xl shadow-md transition-transform duration-200 hover:scale-105",
                size === "sm" ? "size-7" : "size-11",
                gradient,
                glow,
                className,
            )}
        >
            <Icon ref={iconRef} size={size === "sm" ? 16 : 22} duration={1} color="#ffffff" isAnimated />
        </span>
    );
}
