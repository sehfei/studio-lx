"use client";

import { useState } from "react";

export function CategoryTabs({
  tabs,
}: {
  tabs: { key: string; label: string; content: React.ReactNode }[];
}) {
  const [active, setActive] = useState(tabs[0]?.key);

  return (
    <div>
      <div className="mb-8 flex gap-6 border-b border-border-subtle">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActive(tab.key)}
            className={`-mb-px border-b-2 px-1 py-3 text-sm transition-colors ${
              active === tab.key
                ? "border-gold font-medium text-foreground"
                : "border-transparent text-foreground/50 hover:text-foreground/80"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {tabs.find((tab) => tab.key === active)?.content}
    </div>
  );
}
