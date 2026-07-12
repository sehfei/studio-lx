# Webhooks 目录约定（预留，暂无实现）

将来接入 payment gateway、Pushbullet 等第三方回调时，按以下约定：

- 每个提供方一个目录：`src/app/api/webhooks/<provider>/route.ts`
  （例如 `webhooks/stripe/route.ts`、`webhooks/billplz/route.ts`）
- **必须先验签名再处理**：用提供方给的 webhook secret 校验请求签名，
  验不过直接返回 401，绝不能只看 body 内容就信
- webhook secret 放环境变量（如 `STRIPE_WEBHOOK_SECRET`），不加 `NEXT_PUBLIC_` 前缀
- 需要写数据库时用 `@/lib/supabase/admin`（service_role），处理逻辑保持幂等
  （同一事件可能重复推送）
- 响应格式不必走 `@/lib/api/response`，按提供方要求返回（通常 2xx 即确认收到）
