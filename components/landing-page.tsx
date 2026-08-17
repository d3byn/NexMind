import { Show } from "@clerk/nextjs";
import { ArrowRight, Check } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { PageIcon } from "@/components/page-icon";
import { SocialLinks } from "@/components/social-links";
import { Button } from "@/components/ui/button";
import { pageIcons } from "@/lib/page-icons";

const features = [
    {
        key: "notes" as const,
        title: "Notes",
        description: "A rich editor with slash commands and AI refinement for specs, research, and meeting notes.",
    },
    {
        key: "kanban" as const,
        title: "Boards",
        description: "Drag work across columns with priorities, labels, due dates, and live team comments.",
    },
    {
        key: "calendar" as const,
        title: "Calendar",
        description: "Schedule tasks and reminders, park unscheduled drafts, and drop them onto a date.",
    },
    {
        key: "whiteboard" as const,
        title: "Whiteboard",
        description: "Sketch diagrams and map ideas on an infinite canvas, or let AI draw the first version.",
    },
    {
        key: "spaces" as const,
        title: "Pages & Spaces",
        description: "Organise every working document by space, with sharing and linked tasks.",
    },
    {
        key: "ai-assistant" as const,
        title: "AI Assistant",
        description: "Ask it to plan, summarise, or prepare an action — you confirm before anything is saved.",
    },
];

const steps = [
    { title: "Create your account", body: "Sign in and your workspace is ready — no setup checklist." },
    { title: "Capture the work", body: "Notes, boards, calendar, and canvases all live in one place." },
    { title: "Let AI do the rest", body: "Draft, summarise, and diagram without leaving the page." },
];

export function LandingPage() {
    return (
        <div className="min-h-screen text-foreground">
            <header className="sticky top-0 z-50 border-b border-border/70 bg-background/70 backdrop-blur-xl">
                <nav className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
                    <Link href="/" className="flex min-w-0 items-center gap-2.5" aria-label="NexMind home">
                        <PageIcon icon={pageIcons.brand.icon} gradient={pageIcons.brand.gradient} glow={pageIcons.brand.glow} size="sm" />
                        <span className="truncate text-base font-semibold tracking-tight">NexMind</span>
                    </Link>

                    <div className="flex items-center gap-2">
                        <Show when="signed-out">
                            <Button asChild variant="ghost" className="rounded-lg">
                                <Link href="/sign-in">Sign in</Link>
                            </Button>
                            <Button asChild className="rounded-lg">
                                <Link href="/sign-up">Get started</Link>
                            </Button>
                        </Show>
                        <Show when="signed-in">
                            <Button asChild className="rounded-lg">
                                <Link href="/dashboard">
                                    Open dashboard
                                    <ArrowRight className="ml-2 size-4" aria-hidden="true" />
                                </Link>
                            </Button>
                        </Show>
                    </div>
                </nav>
            </header>

            <main>
                <section className="mx-auto w-full max-w-6xl px-4 pb-16 pt-16 text-center sm:px-6 sm:pt-24">
                    <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-3 py-1 text-xs font-semibold text-primary shadow-sm backdrop-blur">
                        <span className="size-1.5 rounded-full bg-primary" aria-hidden="true" />
                        Notes, boards, canvas, and AI in one workspace
                    </span>

                    <h1 className="mx-auto mt-6 max-w-3xl text-balance text-4xl font-semibold leading-[1.1] tracking-tight sm:text-6xl">
                        Think it, plan it,{" "}
                        <span className="bg-[linear-gradient(120deg,var(--grape),hsl(244_74%_54%))] bg-clip-text text-transparent">ship it.</span>
                    </h1>

                    <p className="mx-auto mt-5 max-w-xl text-pretty text-base leading-7 text-muted-foreground sm:text-lg">
                        NexMind brings your notes, tasks, calendar, and whiteboards together — with an AI assistant that
                        actually knows what you are working on.
                    </p>

                    <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                        <Show when="signed-out">
                            <Button asChild size="lg" className="rounded-xl px-7">
                                <Link href="/sign-up">
                                    Start for free
                                    <ArrowRight className="ml-2 size-4" aria-hidden="true" />
                                </Link>
                            </Button>
                            <Button asChild size="lg" variant="outline" className="rounded-xl px-7">
                                <Link href="/sign-in">Sign in</Link>
                            </Button>
                        </Show>
                        <Show when="signed-in">
                            <Button asChild size="lg" className="rounded-xl px-7">
                                <Link href="/dashboard">
                                    Open your dashboard
                                    <ArrowRight className="ml-2 size-4" aria-hidden="true" />
                                </Link>
                            </Button>
                        </Show>
                    </div>

                    <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
                        {["Free plan included", "No credit card", "Your data stays yours"].map((item) => (
                            <li key={item} className="flex items-center gap-1.5">
                                <Check className="size-3.5 text-sage-600" aria-hidden="true" />
                                {item}
                            </li>
                        ))}
                    </ul>

                    <AppPreview />
                </section>

                <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
                    <div className="mx-auto max-w-2xl text-center">
                        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">One workspace, six ways to work</h2>
                        <p className="mt-3 text-base leading-7 text-muted-foreground">
                            Every surface shares the same categories, search, and AI context — so nothing lives on an island.
                        </p>
                    </div>

                    <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {features.map((feature) => {
                            const icon = pageIcons[feature.key];
                            return (
                                <div
                                    key={feature.key}
                                    className="group rounded-2xl border border-border bg-card/85 p-5 shadow-sm backdrop-blur transition-all duration-150 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg"
                                >
                                    <PageIcon icon={icon.icon} gradient={icon.gradient} glow={icon.glow} />
                                    <h3 className="mt-4 text-base font-semibold">{feature.title}</h3>
                                    <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{feature.description}</p>
                                </div>
                            );
                        })}
                    </div>
                </section>

                <section className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6">
                    <div className="grid gap-4 sm:grid-cols-3">
                        {steps.map((step, index) => (
                            <div key={step.title} className="rounded-2xl border border-border bg-card/85 p-5 shadow-sm backdrop-blur">
                                <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold tabular-nums text-primary">
                                    {index + 1}
                                </span>
                                <h3 className="mt-3.5 text-base font-semibold">{step.title}</h3>
                                <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{step.body}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6">
                    <div className="overflow-hidden rounded-3xl bg-[linear-gradient(135deg,var(--grape),hsl(244_74%_54%)_55%,var(--eclipse-900))] px-6 py-14 text-center shadow-xl shadow-primary/25 sm:px-12">
                        <h2 className="text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                            Give your scattered work one home.
                        </h2>
                        <p className="mx-auto mt-3 max-w-lg text-pretty text-sm leading-7 text-white/80 sm:text-base">
                            Set up in under a minute. Bring a note, a board, or a half-formed idea.
                        </p>
                        <div className="mt-7 flex flex-wrap justify-center gap-3">
                            <Show when="signed-out">
                                <Button asChild size="lg" className="rounded-xl bg-white px-7 text-eclipse-900 shadow-lg hover:bg-white hover:brightness-95">
                                    <Link href="/sign-up">
                                        Create your workspace
                                        <ArrowRight className="ml-2 size-4" aria-hidden="true" />
                                    </Link>
                                </Button>
                            </Show>
                            <Show when="signed-in">
                                <Button asChild size="lg" className="rounded-xl bg-white px-7 text-eclipse-900 shadow-lg hover:bg-white hover:brightness-95">
                                    <Link href="/dashboard">
                                        Go to dashboard
                                        <ArrowRight className="ml-2 size-4" aria-hidden="true" />
                                    </Link>
                                </Button>
                            </Show>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="border-t border-border/70 bg-background/70 backdrop-blur-xl">
                <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-6 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:px-6">
                    <div className="flex flex-col items-center gap-2.5 sm:flex-row">
                        <div className="flex items-center gap-2.5">
                            <PageIcon icon={pageIcons.brand.icon} gradient={pageIcons.brand.gradient} glow={pageIcons.brand.glow} size="sm" />
                            <span className="font-semibold text-foreground">NexMind</span>
                        </div>
                        <span className="hidden text-border sm:inline" aria-hidden="true">
                            |
                        </span>
                        <p>Made by Debayan Sarkar 2026</p>
                    </div>

                    <SocialLinks />
                </div>
            </footer>
        </div>
    );
}

function AppPreview() {
    return (
        <div className="mx-auto mt-14 w-full max-w-5xl">
            <div className="overflow-hidden rounded-2xl border border-border bg-card/90 shadow-2xl shadow-primary/15 backdrop-blur">
                <div className="flex items-center gap-1.5 border-b border-border bg-muted/50 px-4 py-3">
                    <span className="size-2.5 rounded-full bg-clay-400" aria-hidden="true" />
                    <span className="size-2.5 rounded-full bg-amber-400" aria-hidden="true" />
                    <span className="size-2.5 rounded-full bg-sage-400" aria-hidden="true" />
                    <span className="ml-3 truncate text-xs text-muted-foreground">nexmind — dashboard</span>
                </div>
                <Image
                    src="/dashboard-preview.png"
                    alt="The NexMind dashboard showing workspace stat cards, quick access shortcuts, a task summary, upcoming calendar items, and recent activity."
                    width={3420}
                    height={1984}
                    priority
                    sizes="(max-width: 1024px) 100vw, 1024px"
                    className="h-auto w-full"
                />
            </div>
        </div>
    );
}
