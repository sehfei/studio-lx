// 商品枚举的维护处：GENDERS/TAGS 数据库 check 约束写死不常变，服务端校验以这里为准。
// CATEGORY（分类）已经改成后台可管理，见 src/lib/categories.ts，不再是写死的常量。

export const GENDERS = ["women", "men"] as const;
export type Gender = (typeof GENDERS)[number];

// Category 现在是分类表里任意存在的 slug，不再是编译期固定的几个值。
export type Category = string;

export const TAGS = ["new-arrival", "best-seller", "promotion"] as const;
export type Tag = (typeof TAGS)[number];
