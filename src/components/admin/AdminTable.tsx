import type { ReactNode } from "react";

// 后台列表页共用的响应式表格：桌面正常表格，手机收窄到一定程度后
// 表格挤不下会互相压字（NAME/EMAIL 粘一起、表头折两行），所以手机
// 改成每行一张卡片，字段名+值上下对齐，比横向滚动表格更好操作。
export type AdminTableColumn = {
  key: string;
  label: string;
  cellClassName?: string;
};

export type AdminTableRow = {
  key: string;
  cells: Partial<Record<string, ReactNode>>;
};

export function AdminTable({
  columns,
  rows,
  emptyText,
}: {
  columns: AdminTableColumn[];
  rows: AdminTableRow[];
  emptyText: string;
}) {
  if (rows.length === 0) {
    return <p className="text-sm text-foreground/50">{emptyText}</p>;
  }

  return (
    <>
      <div className="hidden overflow-x-auto sm:block">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border-subtle text-left text-xs tracking-widest text-foreground/50 uppercase">
              {columns.map((col) => (
                <th key={col.key} className="py-3 pr-4 last:pr-0">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.key} className="border-b border-border-subtle">
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`py-3 pr-4 last:pr-0 ${col.cellClassName ?? ""}`}
                  >
                    {row.cells[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="space-y-3 sm:hidden">
        {rows.map((row) => (
          <li
            key={row.key}
            className="space-y-2.5 border border-border-subtle p-4 text-sm"
          >
            {columns.map((col) => (
              <div
                key={col.key}
                className="flex items-start justify-between gap-4"
              >
                <span className="shrink-0 pt-0.5 text-xs tracking-widest text-foreground/40 uppercase">
                  {col.label}
                </span>
                <span className={`text-right ${col.cellClassName ?? ""}`}>
                  {row.cells[col.key]}
                </span>
              </div>
            ))}
          </li>
        ))}
      </ul>
    </>
  );
}
