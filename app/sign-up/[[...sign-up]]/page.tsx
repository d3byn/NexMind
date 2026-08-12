import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <main style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0F0E47' }}>
      <SignUp fallbackRedirectUrl="/dashboard" />
    </main>
  );
}