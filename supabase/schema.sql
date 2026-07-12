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
