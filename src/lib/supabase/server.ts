import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

// 带当前请求 session 的服务端客户端（anon key + 用户 cookie），
// 用于在 Server Component / Server Action / Route Handler 里读取登录用户。
// setAll 在 Server Component 里会因为不能写 cookie 而抛错，这里静默忽略：
// session 刷新统一由 src/proxy.ts 负责。
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Server Component 里调用时忽略，由 proxy 刷新 session
          }
        },
      },
    },
  );
}
