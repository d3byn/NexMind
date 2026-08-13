import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { AiTemplateBuilderWorkspace } from "@/app/ai-template-builder/ai-template-builder-workspace";
import { listGeneratedApps, listSidebarGeneratedApps } from "@/app/ai-template-builder/actions";
import { AppShell } from "@/components/app-shell";
import { syncCurrentUserToDatabase } from "@/lib/sync-user";
import { PageIcon } from "@/components/page-icon";
import { pageIcons } from "@/lib/page-icons";

export default async function AiTemplateBuilderPage() {
    const user = await currentUser();
    if (!user) {
        redirect("/sign-in");
    }

    await syncCurrentUserToDatabase();
    const [apps, sidebarApps] = await Promise.all([listGeneratedApps(), listSidebarGeneratedApps()]);

    return (
        <AppShell activePage="ai-template-builder" generatedSidebarApps={sidebarApps}>
            <section className="mx-auto flex w-full max-w-[104rem] flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
                <header className="flex flex-col gap-4 border-b border-border pb-6 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0">
                        <div className="flex items-center gap-2 text-sm font-medium text-primary">
                            <PageIcon icon={pageIcons["ai-template-builder"].icon} gradient={pageIcons["ai-template-builder"].gradient} glow={pageIcons["ai-template-builder"].glow} size="sm" />
                            AI Template Builder
                        </div>
                        <h1 className="mt-2 text-3xl font-semibold leading-tight text-foreground">
                            Turn a prompt into a single-page productivity app.
                        </h1>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                            Generate trackers, planners, dashboards, and lightweight templates as private JSON-powered mini apps.
                        </p>
                    </div>
                </header>

                <AiTemplateBuilderWorkspace initialApps={apps} />
            </section>
        </AppShell>
    );
}