import { requireAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getAdminI18n } from "@/lib/i18n/admin";
import { UserRoleEditor } from "./UserRoleEditor";
import { AddUserForm } from "./AddUserForm";
import type { UserRole } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const currentUser = await requireAdmin();
  const { t } = await getAdminI18n();

  const { data } = await supabaseAdmin.auth.admin.listUsers();
  const users = (data?.users ?? []).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  return (
    <div>
      <h1 className="mb-2 text-lg font-medium">User Management</h1>
      <p className="mb-8 text-sm text-foreground/50">
        管理谁能登录后台、员工(Staff)能看到哪些页面。顾客自助注册的账号默认没有后台权限。
      </p>

      <div className="mb-8 border border-border-subtle p-4">
        <p className="eyebrow mb-3">添加新账号</p>
        <AddUserForm navDict={t.sidebar.nav} />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border-subtle text-left text-xs tracking-widest text-foreground/50 uppercase">
              <th className="py-3">Email</th>
              <th className="py-3">Role</th>
              <th className="py-3">Created</th>
              <th className="py-3">Last Sign In</th>
              <th className="py-3">操作</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const role: UserRole =
                u.app_metadata?.role === "admin"
                  ? "admin"
                  : u.app_metadata?.role === "staff"
                    ? "staff"
                    : "customer";
              const permissions = Array.isArray(u.app_metadata?.permissions)
                ? (u.app_metadata.permissions as string[])
                : [];
              const isSelf = u.id === currentUser.id;
              return (
                <tr key={u.id} className="border-b border-border-subtle">
                  <td className="py-3">
                    {u.email}
                    {isSelf && (
                      <span className="ml-2 text-xs text-foreground/40">
                        (你)
                      </span>
                    )}
                  </td>
                  <td className="py-3">
                    <span
                      className={
                        role === "admin"
                          ? "text-gold"
                          : role === "staff"
                            ? "text-foreground/70"
                            : "text-foreground/50"
                      }
                    >
                      {role === "admin"
                        ? "Admin"
                        : role === "staff"
                          ? `Staff (${permissions.length})`
                          : "Customer"}
                    </span>
                  </td>
                  <td className="py-3 text-foreground/60">
                    {new Date(u.created_at).toLocaleDateString("en-MY")}
                  </td>
                  <td className="py-3 text-foreground/60">
                    {u.last_sign_in_at
                      ? new Date(u.last_sign_in_at).toLocaleDateString("en-MY")
                      : "—"}
                  </td>
                  <td className="py-3">
                    <UserRoleEditor
                      userId={u.id}
                      role={role}
                      permissions={permissions}
                      isSelf={isSelf}
                      navDict={t.sidebar.nav}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
