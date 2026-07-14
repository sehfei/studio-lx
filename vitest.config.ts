import { loadEnv } from "vite";
import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "node:path";

// products.ts/reviews.ts 等文件顶层 import 了 @/lib/supabase/client，
// 那个模块在 import 时就要读 NEXT_PUBLIC_SUPABASE_URL/ANON_KEY 建 client——
// 单测不会真的发请求（测的都是不碰网络的纯函数），但模块加载阶段这两个
// 变量必须存在，否则 createClient 直接抛错，所以这里从 .env.local 读进来。
const env = loadEnv("test", process.cwd(), "");

// 单测只测纯逻辑函数，不碰 Supabase/网络。src/lib 里不少文件顶部有
// import "server-only" 防止被打进客户端包——这个包在真正的 react-server
// 环境外 import 会直接 throw，所以这里把它别名成空模块，让 vitest 能正常
// 加载这些文件（不影响实际打包时的行为，那边走的是 Next 自己的解析）。
export default defineConfig({
  plugins: [tsconfigPaths()],
  resolve: {
    alias: {
      "server-only": path.resolve(__dirname, "vitest.server-only-stub.ts"),
    },
  },
  test: {
    environment: "node",
    env: {
      NEXT_PUBLIC_SUPABASE_URL: env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    },
  },
});
