// key 映射到后台词典 sidebar.nav.[key]（见 src/lib/i18n/admin/en.ts）。
// label 保留作 fallback：词典缺该键时仍能显示英文，不会空白。
export const adminNavItems = [
  { key: "dashboard", label: "Dashboard", href: "/admin" },
  { key: "products", label: "Products", href: "/admin/products" },
  { key: "orders", label: "Orders", href: "/admin/orders" },
  { key: "customers", label: "Customers", href: "/admin/customers" },
  { key: "inventory", label: "Inventory", href: "/admin/inventory" },
  { key: "coupons", label: "Coupons", href: "/admin/coupons" },
  { key: "salesReport", label: "Sales Report", href: "/admin/sales-report" },
  { key: "banners", label: "Banner Management", href: "/admin/banners" },
  { key: "categories", label: "Category Management", href: "/admin/categories" },
  { key: "users", label: "User Management", href: "/admin/users" },
  { key: "shipping", label: "Shipping", href: "/admin/shipping" },
  { key: "paymentSettings", label: "Payment Settings", href: "/admin/payment-settings" },
  { key: "settings", label: "Website Settings", href: "/admin/settings" },
] as const;
