import { requireAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { UserRoleToggle } from "./UserRoleToggle";
import { AddAdminForm } from "./AddAdminForm";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const currentUser = await requireAdmin();

  const { data } = await supabaseAdmin.auth.admin.listUsers();
  const users = (data?.users ?? []).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  return (
    <div>
      <h1 className="mb-2 text-lg font-medium">User Management</h1>
      <p className="mb-8 text-sm text-foreground/50">
        管理谁能登录后台。顾客自助注册的账号默认没有管理员权限。
      </p>

      <div className="mb-8 border border-border-subtle p-4">
        <p className="eyebrow mb-3">添加新管理员</p>
        <AddAdminForm />
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
              const isAdmin = u.app_metadata?.role === "admin";
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
                        isAdmin ? "text-gold" : "text-foreground/50"
                      }
                    >
                      {isAdmin ? "Admin" : "Customer"}
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
                    <UserRoleToggle userId={u.id} isAdmin={isAdmin} />
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
