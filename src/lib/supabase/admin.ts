import "server-only";
import { createClient } from "@supabase/supabase-js";

// service_role key 拥有绕过 RLS 的完整数据库权限，只能在服务端代码
// （Server Action / Route Handler）里使用，"server-only" 会在有人
// 不小心从客户端组件 import 这个文件时，直接在构建阶段报错。

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});
