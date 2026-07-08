import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Login" };

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-8">
      <h1 className="section-title mb-8 text-center">Login</h1>
      <form className="space-y-4">
        <input
          className="w-full border border-border-subtle px-4 py-3 text-sm outline-none focus:border-gold"
          placeholder="Email"
          disabled
        />
        <input
          className="w-full border border-border-subtle px-4 py-3 text-sm outline-none focus:border-gold"
          placeholder="Password"
          type="password"
          disabled
        />
        <button className="btn-primary w-full" disabled>
          Login
        </button>
        <button
          className="btn-outline w-full"
          disabled
          type="button"
        >
          Continue with Google
        </button>
      </form>
      <p className="mt-6 text-center text-xs text-foreground/40">
        登录功能开发中（将接入 Supabase Auth）。
      </p>
      <p className="mt-4 text-center text-sm">
        没有账户？<Link href="/register" className="text-gold">注册</Link>
      </p>
    </div>
  );
}
