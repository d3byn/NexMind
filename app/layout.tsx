import { ClerkProvider } from '@clerk/nextjs';
import "@liveblocks/react-ui/styles.css";
import "./globals.css";
import type { Metadata } from "next";
import { LiveblocksAppProvider } from "@/components/liveblocks-app-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { THEME_STORAGE_KEY, type Theme } from "@/lib/theme";
import { getSavedThemePreference } from "@/lib/user-preferences";

export const metadata: Metadata = {
  title: "NexMind | AI Productivity Workspace",
  description:
    "An AI-powered productivity workspace for notes, tasks, whiteboards, calendars, templates, and real-time team collaboration.",
};


function themeScript(saved: Theme | null) {
  return `(function(){try{var k=${JSON.stringify(THEME_STORAGE_KEY)};var s=${JSON.stringify(saved)};if(s){try{localStorage.setItem(k,s)}catch(e){}}var t=s||localStorage.getItem(k)||'system';var d=t==='dark'||(t==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);var r=document.documentElement;r.classList.toggle('dark',d);r.style.colorScheme=d?'dark':'light';}catch(e){}})();`;
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const savedTheme = await getSavedThemePreference();

  return (
    <ClerkProvider afterSignOutUrl="/">
      <html lang="en" suppressHydrationWarning>
        <head>
          <script dangerouslySetInnerHTML={{ __html: themeScript(savedTheme) }} />
        </head>
        <body style={{ margin: 0, padding: 0 }}>
          <ThemeProvider initialTheme={savedTheme}>
            <LiveblocksAppProvider>{children}</LiveblocksAppProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
