import { ClerkProvider } from '@clerk/nextjs';
import "@liveblocks/react-ui/styles.css";
import "./globals.css";
import type { Metadata } from "next";
import { LiveblocksAppProvider } from "@/components/liveblocks-app-provider";
import { ThemeProvider } from "@/components/theme-provider";

export const metadata: Metadata = {
  title: "NexMind | AI Productivity Workspace",
  description:
    "An AI-powered productivity workspace for notes, tasks, whiteboards, calendars, templates, and real-time team collaboration.",
};


const themeScript = `(function(){try{var t=localStorage.getItem('nexmind-theme')||'system';var d=t==='dark'||(t==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d);document.documentElement.style.colorScheme=d?'dark':'light';}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      { }
      <html lang="en" suppressHydrationWarning>
        <head>
          <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        </head>
        <body style={{ margin: 0, padding: 0 }}>
          <ThemeProvider>
            <LiveblocksAppProvider>{children}</LiveblocksAppProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
