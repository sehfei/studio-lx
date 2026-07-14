-- 在 Supabase 后台执行：左侧菜单 SQL Editor -> New query -> 粘贴这整段 -> Run

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  sku text unique not null,
  brand text not null,
  description text not null default '',
  price numeric(10, 2) not null,
  discount_price numeric(10, 2),
  stock integer not null default 0,
  images text[] not null default '{}',
  video text,
  colors text[] not null default '{}',
  sizes text[] not null default '{}',
  material text default '',
  weight text default '',
  shipping_info text default '',
  gender text not null check (gender in ('women', 'men')),
  category text not null check (category in ('clothing', 'shoes', 'bags', 'glasses', 'accessories')),
  tags text[] not null default '{}',
  badge_text text,
  created_at timestamptz not null default now()
);

-- 打开行级安全（Row Level Security），默认拒绝所有操作，
-- 再单独开一条「谁都能查看」的规则，这样商品对所有人可见，
-- 但没有人能用这个公开的 anon key 去新增/修改/删除商品。
alter table products enable row level security;

create policy "Public can read products"
  on products for select
  using (true);

-- 用占位商品数据做种子，跑通页面用
insert into products
  (slug, name, sku, brand, description, price, discount_price, stock, colors, sizes, material, weight, shipping_info, gender, category, tags)
values
  ('silk-tailored-blazer', 'Silk Tailored Blazer', 'LX-W-CL-0001', 'STUDIO LX', '极简剪裁真丝西装外套，适合日常与晚宴场合。', 890, 690, 12, '{Black,Ivory}', '{XS,S,M,L}', '100% Silk', '0.6kg', '西马 2-4 工作日，东马 4-7 工作日', 'women', 'clothing', '{new-arrival,promotion}'),
  ('leather-ankle-boots', 'Leather Ankle Boots', 'LX-W-SH-0002', 'STUDIO LX', '意大利小牛皮踝靴，手工缝制鞋底。', 1290, null, 8, '{Black,Brown}', '{36,37,38,39,40}', 'Full-grain Leather', '1.1kg', '西马 2-4 工作日，东马 4-7 工作日', 'women', 'shoes', '{best-seller}'),
  ('structured-tote-bag', 'Structured Tote Bag', 'LX-W-BG-0003', 'STUDIO LX', '结构感托特包，大容量商务日常两用。', 1590, null, 5, '{Camel,Black}', '{"One Size"}', 'Saffiano Leather', '0.9kg', '西马 2-4 工作日，东马 4-7 工作日', 'women', 'bags', '{best-seller,new-arrival}'),
  ('classic-wool-overcoat', 'Classic Wool Overcoat', 'LX-M-CL-0004', 'STUDIO LX', '经典羊毛大衣，剪裁利落，适合都市通勤。', 1690, 1290, 10, '{Charcoal,Camel}', '{S,M,L,XL}', '90% Wool, 10% Cashmere', '1.4kg', '西马 2-4 工作日，东马 4-7 工作日', 'men', 'clothing', '{promotion}'),
  ('acetate-sunglasses', 'Acetate Sunglasses', 'LX-M-GL-0005', 'STUDIO LX', '意大利板材眼镜框，UV400 防护镜片。', 590, null, 20, '{Tortoise,Black}', '{"One Size"}', 'Acetate', '0.03kg', '西马 2-4 工作日，东马 4-7 工作日', 'men', 'glasses', '{new-arrival}'),
  ('minimal-leather-sneakers', 'Minimal Leather Sneakers', 'LX-M-SH-0006', 'STUDIO LX', '极简小白鞋，头层牛皮，橡胶大底。', 790, null, 15, '{White,Black}', '{40,41,42,43,44}', 'Leather', '0.8kg', '西马 2-4 工作日，东马 4-7 工作日', 'men', 'shoes', '{best-seller}')
on conflict (slug) do nothing;

-- 网站主题设置（单行 JSON），后台 Website Settings 修改，
-- 公开只读（前台渲染要读），写入只走服务端 service_role。
create table if not exists site_settings (
  id integer primary key check (id = 1),
  theme jsonb not null default '{}'::jsonb,
  previous_theme jsonb,
  announcement jsonb not null default '{}'::jsonb,
  identity jsonb not null default '{}'::jsonb,
  pages jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table site_settings enable row level security;

create policy "Public can read site settings"
  on site_settings for select
  using (true);

insert into site_settings (id) values (1) on conflict do nothing;

-- Logo/favicon/hero 图片的存储桶，public=true 让公开 URL 直接可访问
-- （跟 product-images 桶同样的模式），写入只走 service_role。
insert into storage.buckets (id, name, public)
values ('site-assets', 'site-assets', true)
on conflict (id) do nothing;

-- 首页横幅 banner，后台 Banner Management 管理，前台首页读取生效中的。
-- starts_at/ends_at 为空表示不限时间；is_active + 时间窗共同决定是否显示。
create table if not exists banners (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  title text default '',
  subtitle text default '',
  link_url text default '',
  link_text text default '',
  sort_order integer not null default 0,
  is_active boolean not null default true,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now()
);

alter table banners enable row level security;

create policy "Public can read banners"
  on banners for select
  using (true);

-- 订单：免注册下单（顾客不需要账号），结账时填收货信息直接建单。
-- 不开公开读写策略——顾客下单和后台管理全部走 Server Action 里的
-- service_role（supabaseAdmin），绕过 RLS；下单后直接把订单详情
-- 返回给前端渲染确认页，不需要顾客再查询数据库。
-- payment_status 独立于 status：先做「手动收款」，店主在后台联系顾客
-- 收款后手动标记已付款，不对接任何支付网关。
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null,
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  shipping_address text not null,
  shipping_city text not null,
  shipping_state text not null,
  shipping_postcode text not null,
  notes text default '',
  subtotal numeric(10, 2) not null,
  shipping_fee numeric(10, 2) not null default 0,
  total numeric(10, 2) not null,
  status text not null default 'pending'
    check (status in ('pending', 'processing', 'shipped', 'completed', 'cancelled')),
  payment_status text not null default 'unpaid'
    check (payment_status in ('unpaid', 'paid')),
  created_at timestamptz not null default now()
);

alter table orders enable row level security;

-- 商品行是订单的快照（名称/SKU/图片/单价），即使之后商品改名/降价/被删，
-- 历史订单显示的还是下单当时的真实信息。
create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  product_name text not null,
  product_sku text not null,
  product_image text,
  color text,
  size text,
  unit_price numeric(10, 2) not null,
  quantity integer not null check (quantity > 0),
  line_total numeric(10, 2) not null
);

alter table order_items enable row level security;

-- 结账改为必须登录：订单要能按顾客身份查询（订单历史），
-- 所以给 orders 加一列关联 Supabase Auth 的用户 id。
-- 读取仍然全部走 service_role（订单历史页用 requireCustomer() 拿到当前用户后
-- 按 customer_id 查），不开 RLS 公开读策略，跟 orders 表本身的既有约定一致。
alter table orders add column if not exists customer_id uuid references auth.users(id) on delete set null;

-- 收藏：只在商品详情页提供收藏按钮（不是每张商品卡片都加），
-- 收藏页 /wishlist 列出当前登录顾客收藏的商品。
-- 同前面几张表的约定：读写全部走 service_role，不开 RLS 公开策略。
create table if not exists wishlist_items (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (customer_id, product_id)
);

alter table wishlist_items enable row level security;

-- 联系表单：任何访客都能提交（不需要登录），写入走 Server Action 里的
-- service_role，不开公开写策略；后台在 Messages 页查看/标记已读。
create table if not exists contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table contact_messages enable row level security;

-- 运费设置：西马/东马分开计费，配置存进 site_settings 那张单行配置表
-- （跟 theme/announcement/identity/pages 同样的模式），公开可读、写走 service_role。
alter table site_settings add column if not exists shipping jsonb not null default '{}'::jsonb;

-- 分类管理：分类从写死在代码里改成可后台管理。
-- 先建表 + 用现有 5 个分类做种子数据，公开只读、写走 service_role。
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  label text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table categories enable row level security;

create policy "Public can read categories"
  on categories for select
  using (true);

insert into categories (slug, label, sort_order) values
  ('clothing', 'Clothing', 1),
  ('shoes', 'Shoes', 2),
  ('bags', 'Bags', 3),
  ('glasses', 'Glasses', 4),
  ('accessories', 'Accessories', 5)
on conflict (slug) do nothing;

-- products.category 原本是写死的 CHECK 约束，改成引用 categories 表的外键。
-- 现有 8 条商品数据的 category 值都在上面种子数据范围内，外键能直接生效，不用改数据。
-- 约束名是 Postgres 对内联 CHECK 自动生成的默认名，如果你的项目里名字不一样，
-- 这句 drop 不会报错，只是不会真的删掉旧约束——如果后台新增分类后保存商品报错，
-- 提示约束冲突，回来告诉我，我们再手动找真实约束名处理。
alter table products drop constraint if exists products_category_check;
alter table products add constraint products_category_fkey
  foreign key (category) references categories(slug);

-- 博客：从写死的占位文章改成真正的后台可管理内容（建表 + 后台 CRUD）。
-- 封面图复用 site-assets 桶（跟 banner 图同一个桶，blog/ 子目录）。
-- 只公开读已发布的文章，草稿只有后台（service_role）能看到。
create table if not exists blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  excerpt text not null default '',
  content text not null default '',
  cover_image text,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table blog_posts enable row level security;

create policy "Public can read published blog posts"
  on blog_posts for select
  using (is_published = true);

-- 优惠券：折扣码，结账时输入抵扣。不开公开读写策略——
-- 校验和核销都走结账 Server Action 里的 service_role。
create table if not exists coupons (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  type text not null check (type in ('percentage', 'fixed')),
  value numeric(10, 2) not null,
  min_spend numeric(10, 2),
  max_uses integer,
  used_count integer not null default 0,
  is_active boolean not null default true,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

alter table coupons enable row level security;

-- 订单要记录用了哪张券、折扣了多少，方便对账和显示
alter table orders add column if not exists coupon_code text;
alter table orders add column if not exists discount_amount numeric(10, 2) not null default 0;

-- 支付设置：手动收款模式下，给顾客看的收款信息（银行户口等），
-- 存进 site_settings 那张单行配置表，跟 shipping/theme 同样的模式。
alter table site_settings add column if not exists payment jsonb not null default '{}'::jsonb;

-- 性别(女装/男装)管理：从写死在 constants.ts 的 GENDERS 常量改成后台可管理，
-- 跟 categories 同样的模式（建表 + 用现有 2 个性别做种子，公开只读、写走 service_role）。
create table if not exists genders (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  label text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table genders enable row level security;

create policy "Public can read genders"
  on genders for select
  using (true);

insert into genders (slug, label, sort_order) values
  ('women', 'Women', 1),
  ('men', 'Men', 2)
on conflict (slug) do nothing;

-- products.gender 原本是写死的 CHECK 约束，改成引用 genders 表的外键。
-- 现有商品数据的 gender 值都在上面种子数据范围内，外键能直接生效，不用改数据。
alter table products drop constraint if exists products_gender_check;
alter table products add constraint products_gender_fkey
  foreign key (gender) references genders(slug) on update cascade;
