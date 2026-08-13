import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { listSidebarGeneratedApps } from "@/app/ai-template-builder/actions";
import { createWhiteboard, listWhiteboards } from "@/app/whiteboard/actions";
import { WhiteboardWorkspace } from "@/app/whiteboard/whiteboard-workspace";
import { AppShell } from "@/components/app-shell";
import { syncCurrentUserToDatabase } from "@/lib/sync-user";
import { PageIcon } from "@/components/page-icon";
import { pageIcons } from "@/lib/page-icons";

export default async function WhiteboardPage() {
    const user = await currentUser();
    if (!user) {
        redirect("/sign-in");
    }

    await syncCurrentUserToDatabase();
    const sidebarApps = await listSidebarGeneratedApps();
    let boards = await listWhiteboards();
    if (!boards.length) {
        boards = [await createWhiteboard()];
    }

    return (
        <AppShell activePage="whiteboard" generatedSidebarApps={sidebarApps}>
            <section className="flex h-screen min-h-[46rem] w-full flex-col overflow-hidden">
                <header className="shrink-0 border-b border-border px-4 py-3 sm:px-5">
                    <div className="flex items-center gap-2 text-sm font-medium text-primary">
                        <PageIcon icon={pageIcons["whiteboard"].icon} gradient={pageIcons["whiteboard"].gradient} glow={pageIcons["whiteboard"].glow} size="sm" />
                        Whiteboard
                    </div>
                </header>

                <WhiteboardWorkspace initialBoards={boards} />
            </section>
        </AppShell>
    );
}