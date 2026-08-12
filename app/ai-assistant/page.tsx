import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { getAssistantSnapshot } from "@/app/ai-assistant/actions";
import { AiAssistantWorkspace } from "@/app/ai-assistant/ai-assitant-workspace";
import { listSidebarGeneratedApps } from "@/app/ai-template-builder/actions";
import { AppShell } from "@/components/app-shell";
import { syncCurrentUserToDatabase } from "@/lib/sync-user";
import { PageIcon } from "@/components/page-icon";
import { pageIcons } from "@/lib/page-icons";

export default async function AiAssistantPage() {
    const user = await currentUser();
    if (!user) {
        redirect("/sign-in");
    }

    await syncCurrentUserToDatabase();
    const [snapshot, sidebarApps] = await Promise.all([getAssistantSnapshot(), listSidebarGeneratedApps()]);

    return (
        <AppShell activePage="ai-assistant" generatedSidebarApps={sidebarApps}>
            <section className="mx-auto flex h-full min-h-0 w-full max-w-[104rem] flex-col px-4 py-5 sm:px-6 lg:px-8">
                <header className="flex shrink-0 flex-col gap-2 border-b border-border pb-4">
                    <p className="flex items-center gap-2 text-sm font-medium text-primary">
                        <PageIcon icon={pageIcons["ai-assistant"].icon} gradient={pageIcons["ai-assistant"].gradient} glow={pageIcons["ai-assistant"].glow} size="sm" />
                        AI Assistant
                    </p>
                    <h1 className="text-2xl font-semibold leading-tight text-foreground sm:text-3xl">
                        Chat, plan, and act across your workspace.
                    </h1>
                </header>

                <AiAssistantWorkspace initialSnapshot={snapshot} />
            </section>
        </AppShell>
    );
}