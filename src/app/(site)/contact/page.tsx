import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = { title: "Contact Us" };

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-8">
      <h1 className="section-title mb-8">Contact Us</h1>
      <div className="space-y-4 text-sm text-foreground/70">
        <p>WhatsApp：+{siteConfig.whatsappNumber}</p>
        <p>Email：hello@studiolx.example.com</p>
        <p>营业时间：周一至周日 10:00 - 20:00</p>
      </div>
      <form className="mt-10 space-y-4">
        <input
          className="w-full border border-border-subtle px-4 py-3 text-sm outline-none focus:border-gold"
          placeholder="Your Name"
          disabled
        />
        <input
          className="w-full border border-border-subtle px-4 py-3 text-sm outline-none focus:border-gold"
          placeholder="Your Email"
          disabled
        />
        <textarea
          className="w-full border border-border-subtle px-4 py-3 text-sm outline-none focus:border-gold"
          rows={5}
          placeholder="Message"
          disabled
        />
        <button className="btn-primary" disabled>
          Send Message
        </button>
        <p className="text-xs text-foreground/40">表单提交功能开发中。</p>
      </form>
    </div>
  );
}
