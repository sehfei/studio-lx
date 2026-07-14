import { defineConfig, devices } from "@playwright/test";

// 跑之前要先手动 `npm run dev`（不像单元测试，这个是真的打 localhost:3000
// 走完整浏览器 + Server Action 流程）。只测 Chromium，够用了，
// 这不是要保证跨浏览器兼容性的项目。
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  retries: 0,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
});
