"use client";

import Link from "next/link";
import { ExternalLink, Loader2, PanelLeft, Sparkles, Trash2 } from "lucide-react";
import { useMemo, useState, useTransition } from "react";

import {
  deleteGeneratedApp,
  generateGeneratedApp,
  toggleGeneratedAppSidebar,
} from "@/app/ai-template-builder/actions";
import type { GeneratedAppDTO } from "@/app/ai-template-builder/actions";
import { GeneratedAppPreview } from "@/app/ai-template-builder/generated-app-preview";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getGeneratedAppIcon } from "@/lib/generated-app-icons";
import { cn } from "@/lib/utils";

type AiTemplateBuilderWorkspaceProps = {
  initialApps: GeneratedAppDTO[];
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function AiTemplateBuilderWorkspace({ initialApps }: AiTemplateBuilderWorkspaceProps) {
  const [apps, setApps] = useState(initialApps);
  const [prompt, setPrompt] = useState("");
  const [selectedAppId, setSelectedAppId] = useState(initialApps[0]?.id ?? null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const selectedApp = useMemo(
    () => apps.find((app) => app.id === selectedAppId) ?? apps[0] ?? null,
    [apps, selectedAppId],
  );

  function handleGenerate() {
    const cleanPrompt = prompt.trim();
    if (!cleanPrompt) {
      setError("Enter an app idea first.");
      return;
    }

    setError("");
    setMessage("");
    startTransition(async () => {
      try {
        const app = await generateGeneratedApp(cleanPrompt);
        setApps((current) => [app, ...current]);
        setSelectedAppId(app.id);
        setPrompt("");
        setMessage(`${app.appName} is ready.`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not generate the app.");
      }
    });
  }

  function toggleSidebar(app: GeneratedAppDTO) {
    setError("");
    setMessage("");
    startTransition(async () => {
      try {
        const updated = await toggleGeneratedAppSidebar(app.id, !app.isInSidebar);
        setApps((current) => current.map((item) => (item.id === updated.id ? updated : item)));
        setMessage(updated.isInSidebar ? `${updated.appName} was added to the sidebar.` : `${updated.appName} was removed from the sidebar.`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not update the sidebar.");
      }
    });
  }

  function deleteApp(app: GeneratedAppDTO) {
    setError("");
    setMessage("");
    startTransition(async () => {
      try {
        const nextApps = await deleteGeneratedApp(app.id);
        setApps(nextApps);
        setSelectedAppId((current) => (current === app.id ? nextApps[0]?.id ?? null : current));
        setMessage(`${app.appName} was deleted.`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not delete the app.");
      }
    });
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
      <div className="space-y-5">
        <Card className="rounded-xl border-border bg-card shadow-sm">
          <CardContent className="p-5">
            <label htmlFor="template-prompt" className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Sparkles className="size-3.5" aria-hidden="true" />
              </span>
              What do you want to build?
            </label>
            <textarea
              id="template-prompt"
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="Example: Build a cozy weekly meal planner with grocery list, nutrition goals, and prep tasks."
              className="mt-3 min-h-36 w-full resize-none rounded-xl border border-border bg-background px-3 py-3 text-sm leading-6 outline-none transition-colors focus:border-primary/40 focus:bg-card focus:ring-2 focus:ring-primary/15"
            />
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs leading-5 text-muted-foreground">
                Gemini will return structured JSON, then NexMind renders it as a single-page app preview.
              </p>
              <Button type="button" className="rounded-lg" disabled={isPending || !prompt.trim()} onClick={handleGenerate}>
                {isPending ? <Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" /> : <Sparkles className="mr-2 size-4" aria-hidden="true" />}
                Generate
              </Button>
            </div>
            {error && <p className="mt-3 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
            {message && <p className="mt-3 rounded-lg border border-sage-200 bg-sage-100 px-3 py-2 text-sm text-sage-800">{message}</p>}
          </CardContent>
        </Card>

        <section className="space-y-3">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-foreground">Created apps</h2>
              <p className="mt-1 text-sm text-muted-foreground">Your generated templates are private to your account.</p>
            </div>
            <span className="shrink-0 rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold tabular-nums text-muted-foreground">
              {apps.length} saved
            </span>
          </div>

          {apps.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center">
              <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,var(--grape),hsl(244_74%_54%))] text-white shadow-md shadow-primary/25">
                <Sparkles className="size-7" aria-hidden="true" />
              </div>
              <p className="mt-4 text-sm font-semibold">No generated apps yet</p>
              <p className="mt-1.5 text-sm text-muted-foreground">Describe a tracker, planner, or dashboard to create your first one.</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {apps.map((app) => {
                const Icon = getGeneratedAppIcon(app.icon);
                const isSelected = selectedApp?.id === app.id;
                return (
                  <Card
                    key={app.id}
                    className={cn(
                      "relative overflow-hidden rounded-xl bg-card shadow-sm transition-all duration-150",
                      isSelected
                        ? "border-primary/40 ring-2 ring-primary/20"
                        : "border-border hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md",
                    )}
                  >
                    <span className="absolute inset-y-0 left-0 w-1" style={{ backgroundColor: app.color }} aria-hidden="true" />
                    <CardContent className="p-4 pl-5">
                      <button type="button" className="flex w-full gap-3 text-left" onClick={() => setSelectedAppId(app.id)}>
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl text-white" style={{ backgroundColor: app.color }}>
                          <Icon className="size-5" aria-hidden="true" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <h3 className="truncate text-sm font-semibold text-foreground">{app.appName}</h3>
                            {isSelected && (
                              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">Previewing</span>
                            )}
                            {app.isInSidebar && (
                              <span className="flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                                <PanelLeft className="size-2.5" aria-hidden="true" />
                                In sidebar
                              </span>
                            )}
                          </div>
                          <p className="mt-1 line-clamp-2 text-sm leading-5 text-muted-foreground">{app.description}</p>
                          <p className="mt-2 text-xs text-muted-foreground">Created {formatDate(app.createdAt)}</p>
                        </div>
                      </button>
                      <div className="mt-4 flex flex-wrap gap-2 border-t border-border/60 pt-3">
                        <Button asChild size="sm" variant="outline" className="rounded-lg bg-background">
                          <Link href={`/ai-template-builder/${app.id}`}>
                            <ExternalLink className="mr-1.5 size-3.5" aria-hidden="true" />
                            Preview
                          </Link>
                        </Button>
                        <Button type="button" size="sm" variant="outline" className="rounded-lg bg-background" disabled={isPending} onClick={() => toggleSidebar(app)}>
                          <PanelLeft className="mr-1.5 size-3.5" aria-hidden="true" />
                          {app.isInSidebar ? "Remove Sidebar" : "Add to Sidebar"}
                        </Button>
                        <Button type="button" size="sm" variant="ghost" className="rounded-lg text-destructive hover:text-destructive" disabled={isPending} onClick={() => deleteApp(app)}>
                          <Trash2 className="mr-1.5 size-3.5" aria-hidden="true" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </section>
      </div>

      <div className="min-w-0">
        {selectedApp ? (
          <GeneratedAppPreview
            appId={selectedApp.id}
            definition={selectedApp.definition}
            appState={selectedApp.appState}
            onStateChange={(appState) =>
              setApps((current) => current.map((app) => (app.id === selectedApp.id ? { ...app, appState } : app)))
            }
          />
        ) : (
          <div className="flex min-h-[32rem] items-center justify-center rounded-xl border border-dashed border-border bg-card p-8 text-center">
            <div>
              <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,var(--grape),hsl(244_74%_54%))] text-white shadow-md shadow-primary/25">
                <Sparkles className="size-7" aria-hidden="true" />
              </div>
              <p className="mt-4 text-sm font-semibold">Generated preview appears here</p>
              <p className="mt-1.5 max-w-sm text-sm leading-6 text-muted-foreground">
                Your mini app layout, sections, fields, actions, and sample data will render from saved JSON.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}