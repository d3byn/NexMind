import "server-only";

import { auth } from "@clerk/nextjs/server";

import { getCurrentDatabaseUser } from "@/lib/user-preferences";

export async function syncCurrentUserToDatabase() {
    const { userId } = await auth();
    if (!userId) return;

    await getCurrentDatabaseUser();
}
