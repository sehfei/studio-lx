// 商品枚举的唯一维护处：数据库 check 约束（supabase/schema.sql）、
// 表单下拉、服务端校验都以这里为准，改动时需同步 schema.sql。

export const GENDERS = ["women", "men"] as const;
export type Gender = (typeof GENDERS)[number];

export const CATEGORIES = [
  "clothing",
  "shoes",
  "bags",
  "glasses",
  "accessories",
] as const;
export type Category = (typeof CATEGORIES)[number];

export const TAGS = ["new-arrival", "best-seller", "promotion"] as const;
export type Tag = (typeof TAGS)[number];
