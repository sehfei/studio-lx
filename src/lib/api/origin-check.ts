import "server-only";

// 这几个写操作的 API 走 cookie 里的登录态鉴权，浏览器发起的跨站请求会
// 自动带上 cookie——这就是 CSRF 的攻击面。但这个接口本来就设计给外部
// 脚本/工具直接拿 session 调用（见各 route 里的注释），所以不能简单粗暴
// 地要求必须有 Origin。
//
// 真正的判断依据：只要请求是浏览器发出的（fetch/XHR），Origin 头一定存在
// 且浏览器不允许网页 JS 伪造它——所以"有 Origin 但跟 Host 对不上"才是
// CSRF 的信号，直接拒绝；"完全没带 Origin/Referer"说明不是浏览器发起的，
// 放行（脚本/curl 场景），不因此挡住合法的外部调用。
export function isCrossOriginRequest(request: Request): boolean {
  const host = new URL(request.url).host;

  const origin = request.headers.get("origin");
  if (origin) {
    try {
      return new URL(origin).host !== host;
    } catch {
      return true;
    }
  }

  const referer = request.headers.get("referer");
  if (referer) {
    try {
      return new URL(referer).host !== host;
    } catch {
      return true;
    }
  }

  return false;
}
