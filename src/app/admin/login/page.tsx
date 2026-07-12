import type { Metadata } from "next";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Admin Login",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center px-4">
      <div className="w-full max-w-md">
        <h1 className="mb-8 text-center font-display text-lg tracking-widest uppercase">
          Admin Login
        </h1>
        <LoginForm />
      </div>
    </div>
  );
}
