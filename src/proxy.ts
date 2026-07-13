import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

// 只做乐观检查（有没有登录态）+ 刷新 session cookie。
// 「是不是管理员」的白名单校验在 src/lib/auth.ts 的 DAL 里做，
// 每个 admin 页面 / Server Action / API 路由都会再验一次。
//
// 但下面「已登录就跳过登录页」这条必须查 role，不能只查有没有登录——
// 前台顾客注册后也是 Supabase Auth 里的合法登录用户，如果这里只查
// user 存在就跳 /admin，会跟 requireAdmin() 的角色校验打起来：
// proxy 把非管理员的顾客从 /admin/login 弹去 /admin，
// requireAdmin() 一查角色不对又把他们弹回 /admin/login，死循环。
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isLoginPage = pathname === "/admin/login";

  if (!user && !isLoginPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = "";
    return NextResponse.redirect(url);
  }

  const isAdmin = !!user && user.app_metadata?.role === "admin";

  if (isAdmin && isLoginPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: "/admin/:path*",
};
