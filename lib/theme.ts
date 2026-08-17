
export const THEME_STORAGE_KEY = "nexmind-theme";

export const themePreferences = ["system", "light", "dark"] as const;

export type Theme = (typeof themePreferences)[number];

export function isTheme(value: unknown): value is Theme {
    return typeof value === "string" && themePreferences.includes(value as Theme);
}
