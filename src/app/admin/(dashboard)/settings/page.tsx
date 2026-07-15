import type { Metadata } from "next";
import { requirePermission } from "@/lib/auth";
import { getTheme } from "@/lib/theme";
import { getAdminI18n } from "@/lib/i18n/admin";
import { getAnnouncement } from "@/lib/announcement";
import { getIdentity } from "@/lib/identity";
import { getPages } from "@/lib/pages";
import { ThemeForm } from "./ThemeForm";
import { AnnouncementForm } from "./AnnouncementForm";
import { IdentityForm } from "./IdentityForm";
import { PagesForm } from "./PagesForm";

export const metadata: Metadata = { title: "Website Settings" };

// 主题/公告/身份/内容页设置每次都读最新值
export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  await requirePermission("settings");
  const [theme, announcement, identity, pages] = await Promise.all([
    getTheme(),
    getAnnouncement(),
    getIdentity(),
    getPages(),
  ]);

  const { t } = await getAdminI18n();

  return (
    <div className="space-y-12">
      <div>
        <h1 className="mb-2 text-lg font-medium">{t.settings.pageTitle}</h1>
        <p className="mb-8 text-sm text-foreground/50">{t.settings.pageDesc}</p>
        <ThemeForm initial={theme} dict={t.settings} />
      </div>

      <div className="border-t border-border-subtle pt-8">
        <h2 className="mb-2 text-lg font-medium">
          {t.settings.identitySectionTitle}
        </h2>
        <p className="mb-8 text-sm text-foreground/50">
          {t.settings.identitySectionDesc}
        </p>
        <IdentityForm initial={identity} />
      </div>

      <div className="border-t border-border-subtle pt-8">
        <h2 className="mb-2 text-lg font-medium">
          {t.settings.pagesSectionTitle}
        </h2>
        <p className="mb-8 text-sm text-foreground/50">
          {t.settings.pagesSectionDesc}
        </p>
        <PagesForm initial={pages} />
      </div>

      <div className="border-t border-border-subtle pt-8">
        <h2 className="mb-2 text-lg font-medium">
          {t.settings.announcementSectionTitle}
        </h2>
        <p className="mb-8 text-sm text-foreground/50">
          {t.settings.announcementSectionDesc}
        </p>
        <AnnouncementForm initial={announcement} />
      </div>
    </div>
  );
}
