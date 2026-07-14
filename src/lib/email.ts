import "server-only";
import { Resend } from "resend";
import type { PaymentSettings } from "@/lib/payment-settings";

type OrderConfirmationItem = {
  product_name: string;
  quantity: number;
  line_total: number;
};

// 下单成功后发一封确认邮件，内容跟 checkout/success 页面展示的东西对齐：
// 订单号、总金额、逐条商品明细、有配置银行信息的话附上收款账户。
//
// 关键设计：发信失败绝不能连累订单已经创建成功这件事——调用方要用 try/catch
// 包这个函数，失败只打日志，不影响 createOrder() 的返回值。跟优惠码核销失败
// "静默即可"是同一个原则。没配置 RESEND_API_KEY 时直接跳过，不报错。
export async function sendOrderConfirmationEmail(params: {
  to: string;
  orderNumber: string;
  total: number;
  items: OrderConfirmationItem[];
  payment: PaymentSettings;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;

  const resend = new Resend(apiKey);
  const hasBankInfo = Boolean(params.payment.bankName && params.payment.accountNumber);

  const itemsHtml = params.items
    .map(
      (item) =>
        `<tr><td style="padding:4px 8px">${item.product_name} × ${item.quantity}</td><td style="padding:4px 8px;text-align:right">RM ${item.line_total.toFixed(2)}</td></tr>`,
    )
    .join("");

  const bankHtml = hasBankInfo
    ? `<p><strong>银行转账信息</strong><br/>
       银行：${params.payment.bankName}<br/>
       户口名称：${params.payment.accountName}<br/>
       户口号码：${params.payment.accountNumber}</p>
       ${params.payment.instructions ? `<p>${params.payment.instructions}</p>` : ""}`
    : "";

  const html = `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
      <h2>订单已收到</h2>
      <p>订单编号：<strong>${params.orderNumber}</strong></p>
      <table style="width:100%;border-collapse:collapse">${itemsHtml}</table>
      <p style="text-align:right"><strong>总计：RM ${params.total.toFixed(2)}</strong></p>
      ${bankHtml}
      <p>我们的客服将尽快通过电话/WhatsApp 联系您安排付款。</p>
    </div>
  `;

  await resend.emails.send({
    from: "STUDIO LX <orders@studiolx.com>",
    to: params.to,
    subject: `订单确认 ${params.orderNumber} - STUDIO LX`,
    html,
  });
}
