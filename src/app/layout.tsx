import type { Metadata } from "next";
import Script from "next/script";
import {
  Bodoni_Moda,
  Cormorant,
  EB_Garamond,
  Geist,
  Geist_Mono,
  Inter,
  Jost,
  Lato,
  Marcellus,
  Montserrat,
  Playfair_Display,
  Space_Grotesk,
} from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/lib/site-config";
import { getTheme, themeToCssVars } from "@/lib/theme";
import { getIdentity } from "@/lib/identity";

// 默认字体组合是 Playfair + Inter，只预载这两个；
// Geist 只作为 --font-sans 的兜底保险，不再是可选预设，不用预载；
// 其余预设按需加载（font-display: swap）
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  preload: false,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  preload: false,
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const cormorant = Cormorant({
  variable: "--font-cormorant",
  subsets: ["latin"],
  preload: false,
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  preload: false,
});

const marcellus = Marcellus({
  variable: "--font-marcellus",
  subsets: ["latin"],
  weight: "400",
  preload: false,
});

const garamond = EB_Garamond({
  variable: "--font-garamond",
  subsets: ["latin"],
  preload: false,
});

const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  preload: false,
});

const bodoni = Bodoni_Moda({
  variable: "--font-bodoni",
  subsets: ["latin"],
  preload: false,
});

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  preload: false,
});

const fontVariables = [
  geistSans,
  geistMono,
  playfair,
  inter,
  cormorant,
  montserrat,
  marcellus,
  garamond,
  lato,
  bodoni,
  jost,
]
  .map((f) => f.variable)
  .join(" ");

export async function generateMetadata(): Promise<Metadata> {
  const identity = await getIdentity();
  return {
    metadataBase: new URL(siteConfig.url),
    title: {
      default: `${siteConfig.name} | ${siteConfig.tagline}`,
      template: `%s | ${siteConfig.name}`,
    },
    description: siteConfig.description,
    openGraph: {
      type: "website",
      siteName: siteConfig.name,
      title: siteConfig.name,
      description: siteConfig.description,
    },
    // app/favicon.ico 那个文件约定会和这里的 icons 字段同时生效、产生两个
    // <link rel="icon">，浏览器优先取第一个导致后台传的 favicon 显示不出来，
    // 所以默认图标搬到 public/favicon.ico 走普通静态资源，只留这一处控制。
    icons: { icon: identity.faviconUrl ?? "/favicon.ico" },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [theme, identity] = await Promise.all([getTheme(), getIdentity()]);

  return (
    <html
      lang="zh"
      className={`${fontVariables} h-full antialiased`}
      style={themeToCssVars(theme) as React.CSSProperties}
    >
      <body className="flex min-h-full flex-col">
        {children}
        {identity.gaId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${identity.gaId}`}
              strategy="afterInteractive"
            />
            <Script id="ga-init" strategy="afterInteractive">
              {`window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${identity.gaId}');`}
            </Script>
          </>
        )}
        {identity.metaPixelId && (
          <Script id="meta-pixel-init" strategy="afterInteractive">
            {`!function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${identity.metaPixelId}');
              fbq('track', 'PageView');`}
          </Script>
        )}
      </body>
    </html>
  );
}
