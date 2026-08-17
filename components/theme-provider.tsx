"use client";

import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { isTheme, THEME_STORAGE_KEY, type Theme } from "@/lib/theme";

export { THEME_STORAGE_KEY };
export type { Theme };

type ThemeContextValue = {
    theme: Theme;
    resolvedTheme: "light" | "dark";
    setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextValue>({
    theme: "system",
    resolvedTheme: "light",
    setTheme: () => {},
});

export function useTheme() {
    return useContext(ThemeContext);
}

function systemPrefersDark() {
    return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function readStoredTheme(): Theme | null {
    if (typeof window === "undefined") return null;
    try {
        const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
        return isTheme(stored) ? stored : null;
    } catch {
        return null;
    }
}

function storeTheme(theme: Theme) {
    try {
        window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {

    }
}

function applyTheme(theme: Theme) {
    const isDark = theme === "dark" || (theme === "system" && systemPrefersDark());
    const root = document.documentElement;
    root.classList.toggle("dark", isDark);
    root.style.colorScheme = isDark ? "dark" : "light";
    return isDark;
}


export function ThemeProvider({ initialTheme = null, children }: { initialTheme?: Theme | null; children: ReactNode }) {
    const [theme, setThemeState] = useState<Theme>(initialTheme ?? "system");
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        const next = initialTheme ?? readStoredTheme() ?? "system";
        setThemeState(next);
        setIsDark(applyTheme(next));
        if (initialTheme) storeTheme(initialTheme);
    }, [initialTheme]);

    useEffect(() => {
        if (theme !== "system") return;

        const media = window.matchMedia("(prefers-color-scheme: dark)");
        const onChange = () => setIsDark(applyTheme("system"));
        media.addEventListener("change", onChange);
        return () => media.removeEventListener("change", onChange);
    }, [theme]);

    const setTheme = useCallback((next: Theme) => {
        setThemeState(next);
        setIsDark(applyTheme(next));
        storeTheme(next);
    }, []);

    const value = useMemo<ThemeContextValue>(
        () => ({ theme, resolvedTheme: isDark ? "dark" : "light", setTheme }),
        [theme, isDark, setTheme],
    );

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
