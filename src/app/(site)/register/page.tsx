import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Register" };

export default function RegisterPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-8">
      <h1 className="section-title mb-8 text-center">Register</h1>
      <form className="space-y-4">
        <input
          className="w-full border border-border-subtle px-4 py-3 text-sm outline-none focus:border-gold"
          placeholder="Full Name"
          disabled
        />
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
          Create Account
        </button>
        <button className="btn-outline w-full" disabled type="button">
          Continue with Google
        </button>
      </form>
      <p className="mt-6 text-center text-xs text-foreground/40">
        注册功能开发中（将接入 Supabase Auth）。
      </p>
      <p className="mt-4 text-center text-sm">
        已有账户？<Link href="/login" className="text-gold">登录</Link>
      </p>
    </div>
  );
}
