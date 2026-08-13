"use client";

import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type Theme = "light" | "dark" | "system";

export const THEME_STORAGE_KEY = "nexmind-theme";

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
        return stored === "light" || stored === "dark" || stored === "system" ? stored : null;
    } catch {
        return null;
    }
}


function applyTheme(theme: Theme) {
    const isDark = theme === "dark" || (theme === "system" && systemPrefersDark());
    const root = document.documentElement;
    root.classList.toggle("dark", isDark);
    root.style.colorScheme = isDark ? "dark" : "light";
    return isDark;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setThemeState] = useState<Theme>("system");
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        const stored = readStoredTheme() ?? "system";
        setThemeState(stored);
        setIsDark(applyTheme(stored));
    }, []);

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
        try {
            window.localStorage.setItem(THEME_STORAGE_KEY, next);
        } catch {
            
        }
    }, []);

    const value = useMemo<ThemeContextValue>(
        () => ({ theme, resolvedTheme: isDark ? "dark" : "light", setTheme }),
        [theme, isDark, setTheme],
    );

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
