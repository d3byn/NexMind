import { SignIn } from "@clerk/nextjs";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { PageIcon } from "@/components/page-icon";
import { pageIcons } from "@/lib/page-icons";

export default function SignInPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 py-12">
      <Link href="/" className="flex items-center gap-2.5" aria-label="NexMind home">
        <PageIcon icon={pageIcons.brand.icon} gradient={pageIcons.brand.gradient} glow={pageIcons.brand.glow} size="sm" />
        <span className="text-base font-semibold tracking-tight text-foreground">NexMind</span>
      </Link>

      <SignIn fallbackRedirectUrl="/dashboard" signUpUrl="/sign-up" />

      <Link
        href="/"
        className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" aria-hidden="true" />
        Back to home
      </Link>
    </main>
  );
}
