// 商品枚举的维护处：TAGS 数据库 check 约束写死不常变，服务端校验以这里为准。
// GENDER（性别）和 CATEGORY（分类）都已经改成后台可管理，
// 分别见 src/lib/genders.ts 和 src/lib/categories.ts，不再是写死的常量。

// Gender 现在是性别表里任意存在的 slug，不再是编译期固定的 women/men 两个值。
export type Gender = string;

// Category 现在是分类表里任意存在的 slug，不再是编译期固定的几个值。
export type Category = string;

export const TAGS = ["new-arrival", "best-seller", "promotion"] as const;
export type Tag = (typeof TAGS)[number];
