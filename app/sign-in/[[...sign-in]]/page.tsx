import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <main style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0F0E47' }}>
      <SignIn fallbackRedirectUrl="/dashboard" />
    </main>
  );
}