import { test, expect } from "@playwright/test";
import { supabaseAdmin } from "./env";

const STAFF_EMAIL = "e2e-staff-test@studiolx.com";
const PASSWORD = "TestPass123!";

let staffId: string;

test.beforeAll(async () => {
  const staff = await supabaseAdmin.auth.admin.createUser({
    email: STAFF_EMAIL,
    password: PASSWORD,
    email_confirm: true,
    // 只勾了 products 一项权限，coupons 没有——用来测权限清单是不是真的生效
    app_metadata: { role: "staff", permissions: ["products"] },
  });
  if (staff.error || !staff.data.user) throw staff.error;
  staffId = staff.data.user.id;
});

test.afterAll(async () => {
  if (staffId) await supabaseAdmin.auth.admin.deleteUser(staffId);
});

test.beforeEach(async ({ page }) => {
  await page.goto("/admin/login");
  await page.getByPlaceholder("Email").fill(STAFF_EMAIL);
  await page.getByPlaceholder("Password").fill(PASSWORD);
  await page.getByRole("button", { name: "Login" }).click();
  await expect(page).toHaveURL("/admin");
});

test("员工能访问勾选过权限的页面", async ({ page }) => {
  await page.goto("/admin/products");
  await expect(page).toHaveURL("/admin/products");
});

test("员工硬改 URL 访问没有权限的页面会被弹回 /admin 并带 denied 提示", async ({
  page,
}) => {
  await page.goto("/admin/coupons");
  await expect(page).toHaveURL(/\/admin\?denied=coupons/);
});

test("侧边栏只显示勾选过权限的导航项", async ({ page }) => {
  await page.goto("/admin");
  const sidebar = page.locator("aside, nav").first();
  await expect(sidebar.getByRole("link", { name: /coupons/i })).toHaveCount(0);
});
