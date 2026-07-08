export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
};

export const placeholderPosts: BlogPost[] = [
  {
    slug: "summer-styling-guide",
    title: "2026 夏季穿搭指南",
    excerpt: "如何用几件基础单品打造高级感夏日造型。",
    content: "（文章内容待补充）",
    date: "2026-06-01",
  },
  {
    slug: "how-to-choose-leather-bag",
    title: "如何挑选一只值得投资的皮革包",
    excerpt: "从皮质、五金到工艺，选包前你需要知道的事。",
    content: "（文章内容待补充）",
    date: "2026-05-15",
  },
];

export function getPostBySlug(slug: string) {
  return placeholderPosts.find((p) => p.slug === slug);
}
