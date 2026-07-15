// JSON-LD 序列化：< 转成 <，防止商品名称/描述里如果出现 "</script>"
// 这种字符串时，被浏览器的 HTML 解析器提前截断 <script> 标签（HTML 解析
// 发生在 JSON 解析之前，属于经典的结构化数据注入坑）。
export function safeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
