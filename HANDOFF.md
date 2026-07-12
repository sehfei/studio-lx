# studio.lx 工作交接（供新对话接手）

> 上一个 session 环境不稳定（工具输出反复乱码/伪造），故重开。**磁盘文件是好的**，
> 项目 `tsc` 编译通过。新对话每次改动请用 `git diff` 核对真实结果，不要轻信工具回显。

## 项目是什么
Next.js 16 (App Router) + React 19 + Tailwind v4 + Supabase 的**高端时尚电商**（STUDIO LX，卖男女服饰/鞋履/包袋/眼镜/配饰）。前台 `src/app/(site)/` + 后台 `src/app/admin/`。
注意：根目录 `AGENTS.md` 提醒这个 Next.js 16 有破坏性改动，写代码前先看 `node_modules/next/dist/docs/`。

---

## 一、本次已完成（已验证 tsc 通过 + dev 200）

### 1. 后台双语（admin i18n）——已跑通「主题设置」这一页
决策：先跑通一页再铺开、后台用**独立** cookie、后台默认英文。
- 新建 `src/lib/i18n/admin/{en.ts, zh.ts, index.ts}`（后台专用词典 + `getAdminI18n()`，读独立 cookie）
- `src/lib/i18n/config.ts`：加 `ADMIN_LOCALE_COOKIE = "admin_locale"`、`ADMIN_DEFAULT_LOCALE = "en"`
- `src/lib/i18n/actions.ts`：加 `setAdminLocale()`（写 admin_locale cookie，只 revalidate /admin）
- `src/lib/admin-nav.ts`：每项加 `key`（映射词典 sidebar.nav）
- 新建 `src/components/admin/AdminLanguageSwitcher.tsx`
- `settings/page.tsx` + `settings/ThemeForm.tsx`：整页双语（ThemeForm 收 `dict` prop）

### 2. 后台语言按钮位置——右上角 header
- 新建 `src/components/admin/AdminHeader.tsx`：右上角一行 = **账号邮箱 · 返回前台 · EN|中文 · 登出**
- `src/components/admin/AdminSidebar.tsx`：移除语言/返回/登出，只留标题+导航
- `src/app/admin/(dashboard)/layout.tsx`：捕获 `requireAdmin()` 返回的 `session.email`，渲染 AdminHeader

### 3. 前台语言按钮——移位 + 更明显
- `src/components/layout/LanguageSwitcher.tsx`：加**地球图标 + 描边胶囊**，`EN | 中文` 竖线分隔，当前金色加粗
- `src/components/layout/Navbar.tsx`：语言切换从最左**移到账户右边**

### 4. 设计系统做成了可复用 skill（在全局，不在本项目）
`~/.claude/skills/nextjs-design-system/`（token 层 + 主题注入 + 后台可视化配色，通用骨架）。

---

## 二、待办（未开始或未完成）

### A. 字体现代化 —— 已选定方案，但**一个字都还没改**（被打断）
决策：**Space Grotesk（标题）+ Inter（正文）**，前后台共用，老预设保留。
实现步骤（给新对话）：
1. `src/app/layout.tsx`：`import { Space_Grotesk } from "next/font/google"`，注册 `const spaceGrotesk = Space_Grotesk({ variable: "--font-space-grotesk", subsets: ["latin"] })`，加进 fontVariables 数组；把 `playfair` 改 `preload: false`（不再是默认）
2. `src/lib/theme.ts`：`FONT_PRESETS` 加 `{ id: "space-grotesk-inter", label: "Space Grotesk + Inter（现代，默认）", displayVar: "--font-space-grotesk", sansVar: "--font-inter" }`；把 `DEFAULT_THEME.fontPreset` 改成 `"space-grotesk-inter"`
3. `src/lib/i18n/admin/{en,zh}.ts`：`settings.fontPresets` 里补 `"space-grotesk-inter"` 的中英标签
4. 验证：`npx tsc --noEmit` + dev 打开首页看标题是否变 Space Grotesk

### B. 后台其余页面铺开翻译（现在还是中文）
待翻译：商品/订单/客户/库存/优惠券/横幅/分类/用户/运费/支付/报表/仪表盘，
以及 `settings/page.tsx` 里另外 3 块（品牌联系 IdentityForm、页面内容 PagesForm、公告 AnnouncementForm）、登录页。
做法照「主题设置页」那套：页面 `await getAdminI18n()` → 传 `dict` 给 client 表单 → 词典加键。

### C. 前台默认语言（待你最终确认）
你说过「前台默认中文」，但**现状默认是英文**（`config.ts` 的 `DEFAULT_LOCALE = "en"`）。
若要改中文：把 `DEFAULT_LOCALE` 改成 `"zh"`。这会影响所有新访客，故未擅自改。

---

## 三、关键坑（务必记住）
1. **`globals.css` 注释绝不能有中文/非 ASCII** —— Tailwind v4 会静默崩坏并在别处乱报错。TS 文件里的中文注释没问题。
2. 后台语言独立前台：前台 `LOCALE_COOKIE=locale`，后台 `admin_locale`，两套互不影响。
3. 前台 client 组件拿翻译的惯例：server 页 `getI18n()` → 把 `dict`/`locale` 当 props 传给 client 组件。
4. 主题字体前后台共用（root layout 注入），改默认预设两边一起变。

## 四、验证命令
```
cd /Users/sehfei/studio.lx
npx tsc --noEmit          # 类型检查
git diff --stat           # 看改动总览
git diff <file>           # 看单个文件真实改动
```
