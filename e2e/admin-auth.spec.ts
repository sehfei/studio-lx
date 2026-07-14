import { test, expect } from "@playwright/test";
import { supabaseAdmin } from "./env";

const ADMIN_EMAIL = "e2e-admin-test@studiolx.com";
const NON_ADMIN_EMAIL = "e2e-nonadmin-test@studiolx.com";
const PASSWORD = "TestPass123!";

let adminId: string;
let nonAdminId: string;

test.beforeAll(async () => {
  const admin = await supabaseAdmin.auth.admin.createUser({
    email: ADMIN_EMAIL,
    password: PASSWORD,
    email_confirm: true,
    app_metadata: { role: "admin" },
  });
  if (admin.error || !admin.data.user) throw admin.error;
  adminId = admin.data.user.id;

  // 没有 role/permissions 的普通账号，模拟"注册了账号但不是管理员"的情况
  const nonAdmin = await supabaseAdmin.auth.admin.createUser({
    email: NON_ADMIN_EMAIL,
    password: PASSWORD,
    email_confirm: true,
  });
  if (nonAdmin.error || !nonAdmin.data.user) throw nonAdmin.error;
  nonAdminId = nonAdmin.data.user.id;
});

test.afterAll(async () => {
  if (adminId) await supabaseAdmin.auth.admin.deleteUser(adminId);
  if (nonAdminId) await supabaseAdmin.auth.admin.deleteUser(nonAdminId);
});

test("管理员账号登录成功进入后台", async ({ page }) => {
  await page.goto("/admin/login");
  await page.getByPlaceholder("Email").fill(ADMIN_EMAIL);
  await page.getByPlaceholder("Password").fill(PASSWORD);
  await page.getByRole("button", { name: "Login" }).click();
  await expect(page).toHaveURL("/admin");
});

test("密码错误时停留在登录页并提示", async ({ page }) => {
  await page.goto("/admin/login");
  await page.getByPlaceholder("Email").fill(ADMIN_EMAIL);
  await page.getByPlaceholder("Password").fill("WrongPassword123!");
  await page.getByRole("button", { name: "Login" }).click();
  await expect(page).toHaveURL("/admin/login");
  await expect(page.getByText("邮箱或密码错误")).toBeVisible();
});

test("非管理员账号登录成功但被后台挡回登录页", async ({ page }) => {
  await page.goto("/admin/login");
  await page.getByPlaceholder("Email").fill(NON_ADMIN_EMAIL);
  await page.getByPlaceholder("Password").fill(PASSWORD);
  await page.getByRole("button", { name: "Login" }).click();
  await expect(page).toHaveURL("/admin/login");
});
