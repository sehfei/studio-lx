import { cache } from "react";
import { supabase } from "@/lib/supabase/client";
import type { Locale } from "@/lib/i18n/config";

// 可在后台编辑的内容页（关于我们、运费退换货）。每页存中英双语标题+正文，
// 前台按当前语言选，为空时回退到内置默认文案。存在 pages_settings.pages。

export type PageContent = {
  titleEn: string;
  titleZh: string;
  bodyEn: string;
  bodyZh: string;
};

export type PageKey = "about" | "shipping" | "privacy" | "terms";

export type SitePages = Record<PageKey, PageContent>;

const EMPTY: PageContent = { titleEn: "", titleZh: "", bodyEn: "", bodyZh: "" };
const EMPTY_PAGES: SitePages = {
  about: { ...EMPTY },
  shipping: { ...EMPTY },
  privacy: { ...EMPTY },
  terms: { ...EMPTY },
};

// 内置默认文案，后台没填时用这个，保证页面永远有内容。
// privacy/terms 是通用模板占位文案，正式上线前建议找律师确认马来西亚 PDPA 合规性。
export const DEFAULT_PAGES: SitePages = {
  about: {
    titleEn: "About Us",
    titleZh: "关于我们",
    bodyEn:
      "STUDIO LX is a curated fashion boutique for Southeast Asia, offering designer apparel, shoes, bags, eyewear and accessories with an emphasis on quality and timeless design.",
    bodyZh:
      "STUDIO LX 是一家专注东南亚市场的高端时尚精品店，甄选男女服饰、鞋履、包袋、眼镜与配饰，为顾客带来兼具设计感与品质的购物体验。",
  },
  shipping: {
    titleEn: "Shipping & Returns",
    titleZh: "运费与退换货",
    bodyEn:
      "West Malaysia: 2–4 working days. East Malaysia: 4–7 working days.\n\nReturns and exchanges are accepted within 7 days of receipt for unworn items with tags attached. Please contact us to arrange a return.",
    bodyZh:
      "西马：2-4 工作日送达。东马：4-7 工作日送达。\n\n收到商品 7 天内，未穿着且吊牌完整的商品可申请退换。请联系客服安排退货。",
  },
  privacy: {
    titleEn: "Privacy Policy",
    titleZh: "隐私政策",
    bodyEn:
      "This Privacy Policy explains how STUDIO LX collects, uses and protects your personal information.\n\nInformation we collect: when you place an order or create an account, we collect your name, phone number, delivery address and email address.\n\nHow we use it: to process and deliver your order, to contact you about your purchase, and to provide customer support. We do not sell or rent your personal information to third parties.\n\nCookies: our website uses cookies to remember your cart and preferences.\n\nYour rights: you may contact us at any time to review, update or request deletion of your personal information.\n\nThis is a general template and has not been reviewed by a lawyer. Please seek professional legal advice before relying on it, including for compliance with Malaysia's Personal Data Protection Act (PDPA).",
    bodyZh:
      "本隐私政策说明 STUDIO LX 如何收集、使用及保护您的个人信息。\n\n我们收集的信息：当您下单或注册账号时，我们会收集您的姓名、电话号码、收货地址和电子邮箱。\n\n我们如何使用：用于处理及配送订单、就购买事宜与您联系、提供客户服务。我们不会向第三方出售或出租您的个人信息。\n\nCookie：本网站使用 Cookie 记住您的购物车和偏好设置。\n\n您的权利：您可以随时联系我们查询、更新或要求删除您的个人信息。\n\n本文为通用模板，尚未经律师审核。正式使用前请寻求专业法律意见，包括确认是否符合马来西亚《个人数据保护法》(PDPA) 的要求。",
  },
  terms: {
    titleEn: "Terms of Service",
    titleZh: "服务条款",
    bodyEn:
      "By using this website and placing an order, you agree to the following terms.\n\nOrders and payment: STUDIO LX currently uses manual bank transfer payment. After you place an order, our team will contact you via WhatsApp or email to arrange payment.\n\nReturns and exchanges: items may be returned or exchanged within 7 days of receipt if unworn and with tags attached. Please contact us to arrange a return.\n\nLimitation of liability: STUDIO LX is not liable for indirect or consequential loss arising from use of this website.\n\nGoverning law: these terms are governed by the laws of Malaysia.\n\nThis is a general template and has not been reviewed by a lawyer. Please seek professional legal advice before relying on it.",
    bodyZh:
      "使用本网站并下单，即表示您同意以下条款。\n\n订单与付款：STUDIO LX 目前采用手动银行转账收款模式，下单后客服会通过 WhatsApp 或邮件联系您安排付款。\n\n退换货：收到商品 7 天内，未穿着且吊牌完整的商品可申请退换。请联系客服安排退货。\n\n责任限制：对于因使用本网站而产生的间接或衍生损失，STUDIO LX 不承担责任。\n\n适用法律：本条款受马来西亚法律管辖。\n\n本文为通用模板，尚未经律师审核。正式使用前请寻求专业法律意见。",
  },
};

function mergePages(partial: unknown): SitePages {
  const p = (partial ?? {}) as Partial<Record<PageKey, Partial<PageContent>>>;
  const one = (key: PageKey): PageContent => ({
    ...EMPTY,
    ...(p[key] ?? {}),
  });
  return {
    about: one("about"),
    shipping: one("shipping"),
    privacy: one("privacy"),
    terms: one("terms"),
  };
}

export const getPages = cache(async (): Promise<SitePages> => {
  try {
    const { data, error } = await supabase
      .from("pages_settings")
      .select("pages")
      .eq("id", 1)
      .maybeSingle();
    if (error || !data) return EMPTY_PAGES;
    return mergePages(data.pages);
  } catch {
    return EMPTY_PAGES;
  }
});

// 按当前语言取标题/正文，后台没填则回退默认文案
export function resolvePage(
  pages: SitePages,
  key: PageKey,
  locale: Locale,
): { title: string; body: string } {
  const stored = pages[key];
  const fallback = DEFAULT_PAGES[key];
  const pick = (en: string, zh: string, defEn: string, defZh: string) => {
    if (locale === "zh") return zh || defZh;
    return en || defEn;
  };
  return {
    title: pick(stored.titleEn, stored.titleZh, fallback.titleEn, fallback.titleZh),
    body: pick(stored.bodyEn, stored.bodyZh, fallback.bodyEn, fallback.bodyZh),
  };
}
