import { createClient } from "@supabase/supabase-js";

// 纯 anon key 客户端，只用于公开只读查询（受 RLS 限制），
// 服务端和客户端都可以用。带登录态的服务端客户端见 ./server.ts。

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
