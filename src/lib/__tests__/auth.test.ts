import { describe, expect, it } from "vitest";
import type { User } from "@supabase/supabase-js";
import { hasAdminPermission, isAdminUser, isBackendUser } from "@/lib/auth";

// app_metadata.role/permissions 是唯一的权限判断依据（只能由 service_role
// 写入，见 auth.ts 顶部注释），这里用假 User 对象覆盖 admin/staff/customer
// 三种账号类型的判断逻辑，不碰真正的 Supabase 请求。
function fakeUser(appMetadata: Record<string, unknown>): User {
  return {
    id: "u1",
    app_metadata: appMetadata,
    user_metadata: {},
    aud: "authenticated",
    created_at: "",
  } as User;
}

describe("isAdminUser", () => {
  it("role 为 admin 时是管理员", () => {
    expect(isAdminUser(fakeUser({ role: "admin" }))).toBe(true);
  });

  it("role 不是 admin 时不是管理员", () => {
    expect(isAdminUser(fakeUser({ role: "staff" }))).toBe(false);
    expect(isAdminUser(fakeUser({}))).toBe(false);
  });

  it("null 用户不是管理员", () => {
    expect(isAdminUser(null)).toBe(false);
  });
});

describe("isBackendUser", () => {
  it("admin 永远是有效后台账号", () => {
    expect(isBackendUser(fakeUser({ role: "admin" }))).toBe(true);
  });

  it("staff 且 permissions 非空是有效后台账号", () => {
    expect(
      isBackendUser(fakeUser({ role: "staff", permissions: ["products"] })),
    ).toBe(true);
  });

  it("staff 但 permissions 为空不是有效后台账号", () => {
    expect(isBackendUser(fakeUser({ role: "staff", permissions: [] }))).toBe(
      false,
    );
    expect(isBackendUser(fakeUser({ role: "staff" }))).toBe(false);
  });

  it("普通顾客（无 role）不是后台账号", () => {
    expect(isBackendUser(fakeUser({}))).toBe(false);
  });

  it("null 用户不是后台账号", () => {
    expect(isBackendUser(null)).toBe(false);
  });
});

describe("hasAdminPermission", () => {
  it("admin 对任何权限 key 都放行", () => {
    expect(hasAdminPermission(fakeUser({ role: "admin" }), "products")).toBe(
      true,
    );
    expect(hasAdminPermission(fakeUser({ role: "admin" }), "auditLog")).toBe(
      true,
    );
  });

  it("staff 只对勾选过的权限 key 放行", () => {
    const user = fakeUser({ role: "staff", permissions: ["products", "orders"] });
    expect(hasAdminPermission(user, "products")).toBe(true);
    expect(hasAdminPermission(user, "coupons")).toBe(false);
  });

  it("普通顾客对任何权限 key 都不放行", () => {
    expect(hasAdminPermission(fakeUser({}), "products")).toBe(false);
  });

  it("permissions 里混入非字符串值时会被过滤，不影响判断", () => {
    const user = fakeUser({ role: "staff", permissions: ["products", 42, null] });
    expect(hasAdminPermission(user, "products")).toBe(true);
    expect(hasAdminPermission(user, "orders")).toBe(false);
  });
});
