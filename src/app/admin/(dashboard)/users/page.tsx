import { requireAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getAdminI18n } from "@/lib/i18n/admin";
import { UserRoleEditor } from "./UserRoleEditor";
import { AddUserForm } from "./AddUserForm";
import type { UserRole } from "./actions";
import { AdminTable } from "@/components/admin/AdminTable";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const currentUser = await requireAdmin();
  const { t } = await getAdminI18n();
  const dict = t.pages.users;

  const { data } = await supabaseAdmin.auth.admin.listUsers();
  const users = (data?.users ?? []).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  return (
    <div>
      <h1 className="mb-2 text-lg font-medium">{dict.title}</h1>
      <p className="mb-8 text-sm text-foreground/50">{dict.desc}</p>

      <div className="mb-8 border border-border-subtle p-4">
        <p className="eyebrow mb-3">{dict.addNew}</p>
        <AddUserForm navDict={t.sidebar.nav} />
      </div>

      <AdminTable
        emptyText={dict.empty}
        columns={[
          { key: "email", label: dict.columns.email },
          { key: "role", label: dict.columns.role },
          { key: "created", label: dict.columns.created, cellClassName: "text-foreground/60" },
          { key: "lastSignIn", label: dict.columns.lastSignIn, cellClassName: "text-foreground/60" },
          { key: "actions", label: dict.columns.actions },
        ]}
        rows={users.map((u) => {
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
          return {
            key: u.id,
            cells: {
              email: (
                <>
                  {u.email}
                  {isSelf && (
                    <span className="ml-2 text-xs text-foreground/40">
                      {dict.selfSuffix}
                    </span>
                  )}
                </>
              ),
              role: (
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
                    ? dict.roleAdmin
                    : role === "staff"
                      ? dict.roleStaff.replace("{n}", String(permissions.length))
                      : dict.roleCustomer}
                </span>
              ),
              created: new Date(u.created_at).toLocaleDateString("en-MY"),
              lastSignIn: u.last_sign_in_at
                ? new Date(u.last_sign_in_at).toLocaleDateString("en-MY")
                : "—",
              actions: (
                <UserRoleEditor
                  userId={u.id}
                  role={role}
                  permissions={permissions}
                  isSelf={isSelf}
                  navDict={t.sidebar.nav}
                />
              ),
            },
          };
        })}
      />
    </div>
  );
}
