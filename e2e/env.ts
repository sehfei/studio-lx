import { readFileSync } from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

// Playwright Test 不会自动加载 .env.local，这里手动解析拿到
// service_role key，跟这次会话里 .tmp-*.js 手动建测试数据的模式一致。
function readEnvLocal(): Record<string, string> {
  const content = readFileSync(
    path.resolve(__dirname, "../.env.local"),
    "utf8",
  );
  const env: Record<string, string> = {};
  for (const line of content.split("\n")) {
    const match = line.match(/^([A-Z_]+)=(.*)$/);
    if (match) env[match[1]] = match[2];
  }
  return env;
}

export const env = readEnvLocal();

export const supabaseAdmin = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
);
