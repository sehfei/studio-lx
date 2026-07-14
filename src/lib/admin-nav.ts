// key 映射到后台词典 sidebar.nav.[key]（见 src/lib/i18n/admin/en.ts）。
// label 保留作 fallback：词典缺该键时仍能显示英文，不会空白。
// staffAssignable: 员工(staff)权限清单里能不能勾这一项。
// dashboard 是登录后的安全落地页，users 是账号权限管理本身，
// 这两项永远是 false，只有店主(admin)能看，不进员工的权限清单。
export const adminNavItems = [
  { key: "dashboard", label: "Dashboard", href: "/admin", staffAssignable: false },
  { key: "products", label: "Products", href: "/admin/products", staffAssignable: true },
  { key: "orders", label: "Orders", href: "/admin/orders", staffAssignable: true },
  { key: "customers", label: "Customers", href: "/admin/customers", staffAssignable: true },
  { key: "messages", label: "Messages", href: "/admin/messages", staffAssignable: true },
  { key: "inventory", label: "Inventory", href: "/admin/inventory", staffAssignable: true },
  { key: "coupons", label: "Coupons", href: "/admin/coupons", staffAssignable: true },
  { key: "salesReport", label: "Sales Report", href: "/admin/sales-report", staffAssignable: true },
  { key: "banners", label: "Banner Management", href: "/admin/banners", staffAssignable: true },
  { key: "blog", label: "Blog", href: "/admin/blog", staffAssignable: true },
  { key: "categories", label: "Category Management", href: "/admin/categories", staffAssignable: true },
  { key: "genders", label: "Gender Management", href: "/admin/genders", staffAssignable: true },
  { key: "users", label: "User Management", href: "/admin/users", staffAssignable: false },
  { key: "shipping", label: "Shipping", href: "/admin/shipping", staffAssignable: true },
  { key: "paymentSettings", label: "Payment Settings", href: "/admin/payment-settings", staffAssignable: true },
  { key: "settings", label: "Website Settings", href: "/admin/settings", staffAssignable: true },
  { key: "auditLog", label: "Audit Log", href: "/admin/audit-log", staffAssignable: true },
] as const;

export type AdminNavKey = (typeof adminNavItems)[number]["key"];

export const staffAssignableNavItems = adminNavItems.filter(
  (item) => item.staffAssignable,
);
export const staffAssignableNavKeys = staffAssignableNavItems.map(
  (item) => item.key,
);
export type AdminPermissionKey = (typeof staffAssignableNavItems)[number]["key"];
