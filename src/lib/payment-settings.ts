import { fetchSiteSettingsRow } from "@/lib/site-settings";

// 手动收款模式：这里配置的银行信息显示在订单确认页，
// 顾客下单后照着转账，店主在后台订单页收到款后手动标记「已付款」。
export type PaymentSettings = {
  bankName: string;
  accountName: string;
  accountNumber: string;
  instructions: string;
};

export const DEFAULT_PAYMENT_SETTINGS: PaymentSettings = {
  bankName: "",
  accountName: "",
  accountNumber: "",
  instructions: "",
};

export function mergePaymentSettings(partial: unknown): PaymentSettings {
  const p = (partial ?? {}) as Partial<PaymentSettings>;
  return {
    bankName: typeof p.bankName === "string" ? p.bankName : "",
    accountName: typeof p.accountName === "string" ? p.accountName : "",
    accountNumber: typeof p.accountNumber === "string" ? p.accountNumber : "",
    instructions: typeof p.instructions === "string" ? p.instructions : "",
  };
}

export async function getPaymentSettings(): Promise<PaymentSettings> {
  try {
    const row = await fetchSiteSettingsRow();
    if (!row) return DEFAULT_PAYMENT_SETTINGS;
    return mergePaymentSettings(row.payment);
  } catch {
    return DEFAULT_PAYMENT_SETTINGS;
  }
}
