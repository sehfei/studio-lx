"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

export type CreateAdminFormState = { error?: string; success?: string } | undefined;

export async function createAdminUser(
  _prevState: CreateAdminFormState,
  formData: FormData,
): Promise<CreateAdminFormState> {
  await requireAdmin();

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "请填写邮箱和密码" };
  }
  if (password.length < 6) {
    return { error: "密码至少需要 6 位" };
  }

  const { error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    app_metadata: { role: "admin" },
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/users");
  return { success: `管理员账号 ${email} 创建成功` };
}

async function countAdmins(): Promise<number> {
  const { data } = await supabaseAdmin.auth.admin.listUsers();
  return (data?.users ?? []).filter((u) => u.app_metadata?.role === "admin")
    .length;
}

export async function toggleAdminRole(
  userId: string,
  makeAdmin: boolean,
): Promise<{ error?: string } | undefined> {
  await requireAdmin();

  if (!makeAdmin) {
    // 不能把最后一个管理员降级，否则整个后台就没人能登录了
    const adminCount = await countAdmins();
    if (adminCount <= 1) {
      return { error: "至少要保留一个管理员账号，不能取消最后一个" };
    }
  }

  const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    app_metadata: { role: makeAdmin ? "admin" : null },
  });
  if (error) return { error: error.message };

  revalidatePath("/admin/users");
}
