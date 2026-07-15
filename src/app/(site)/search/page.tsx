import type { Metadata } from "next";
import { getI18n } from "@/lib/i18n/dictionaries";
import { SearchClient } from "./SearchClient";

export const metadata: Metadata = {
  title: "Search",
  alternates: { canonical: "/search" },
};

export default async function SearchPage() {
  const { t } = await getI18n();
  return <SearchClient t={t} />;
}
