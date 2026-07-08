import type { Metadata } from "next";

export const metadata: Metadata = { title: "FAQ" };

const faqs = [
  { q: "如何查询订单状态？", a: "登录后进入「我的账户 > Order History」查看。" },
  { q: "支持哪些付款方式？", a: "支付功能开发中，即将上线。" },
  { q: "配送需要多久？", a: "西马 2-4 工作日，东马 4-7 工作日。" },
  { q: "可以退换货吗？", a: "收到商品 7 天内可申请退换，详情请联系客服。" },
];

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-8">
      <h1 className="section-title mb-10">FAQ</h1>
      <div className="divide-y divide-border-subtle border-t border-b border-border-subtle">
        {faqs.map((item) => (
          <details key={item.q} className="group py-4">
            <summary className="cursor-pointer text-sm font-medium marker:content-none">
              {item.q}
            </summary>
            <p className="mt-3 text-sm text-foreground/70">{item.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
