"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { staffAssignableNavKeys } from "@/lib/admin-nav";
import { logAdminAction } from "@/lib/audit-log";

export type UserRole = "customer" | "staff" | "admin";

export type CreateUserFormState = { error?: string; success?: string } | undefined;

// 白名单过滤：只留 admin-nav.ts 里标记 staffAssignable 的 key，
// 防止 users/dashboard 这类店主专属项被夹带进员工权限清单
// （不管是前端漏勾还是有人直接拼 formData 绕过 UI）。
function sanitizePermissions(input: string[]): string[] {
  const allowed: readonly string[] = staffAssignableNavKeys;
  return input.filter((p) => allowed.includes(p));
}

export async function createBackendUser(
  _prevState: CreateUserFormState,
  formData: FormData,
): Promise<CreateUserFormState> {
  const admin = await requireAdmin();

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const role = String(formData.get("role") ?? "staff");
  const permissions = sanitizePermissions(
    formData.getAll("permissions").map(String),
  );

  if (!email || !password) {
    return { error: "请填写邮箱和密码" };
  }
  if (password.length < 6) {
    return { error: "密码至少需要 6 位" };
  }
  if (role !== "admin" && role !== "staff") {
    return { error: "角色不合法" };
  }

  const app_metadata =
    role === "admin" ? { role: "admin" } : { role: "staff", permissions };

  const { error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    app_metadata,
  });

  if (error) {
    return { error: error.message };
  }

  await logAdminAction(admin, {
    action: "user.create",
    targetType: "user",
    summary: `创建后台账号 ${email}（角色：${role}）`,
    summaryParams: { email, role: role === "admin" ? "roleAdmin" : "roleStaff" },
  });

  revalidatePath("/admin/users");
  return { success: `账号 ${email} 创建成功` };
}

async function countAdmins(): Promise<number> {
  const { data } = await supabaseAdmin.auth.admin.listUsers();
  return (data?.users ?? []).filter((u) => u.app_metadata?.role === "admin")
    .length;
}

export async function setUserRole(
  userId: string,
  role: UserRole,
  permissions: string[] = [],
): Promise<{ error?: string } | undefined> {
  const admin = await requireAdmin();

  const { data } = await supabaseAdmin.auth.admin.getUserById(userId);
  const wasAdmin = data.user?.app_metadata?.role === "admin";

  if (wasAdmin && role !== "admin") {
    // 不能把最后一个管理员降级，否则整个后台就没人能登录了
    const adminCount = await countAdmins();
    if (adminCount <= 1) {
      return { error: "至少要保留一个管理员账号，不能取消最后一个" };
    }
  }

  const app_metadata =
    role === "admin"
      ? { role: "admin", permissions: null }
      : role === "staff"
        ? { role: "staff", permissions: sanitizePermissions(permissions) }
        : { role: null, permissions: null };

  const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    app_metadata,
  });
  if (error) return { error: error.message };

  await logAdminAction(admin, {
    action: "user.role_change",
    targetType: "user",
    targetId: userId,
    summary: `修改用户角色为「${role}」（用户 ID: ${userId}）`,
    summaryParams: {
      role:
        role === "admin"
          ? "roleAdmin"
          : role === "staff"
            ? "roleStaff"
            : "roleCustomer",
      userId,
    },
  });

  revalidatePath("/admin/users");
}
