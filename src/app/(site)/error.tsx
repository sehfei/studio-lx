"use client";

// 错误边界是客户端组件，拿不到服务端的语言 cookie，直接中英双语兜底。
export default function SiteError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-8">
      <h1 className="section-title mb-6">Something went wrong / 出错了</h1>
      <p className="mb-8 text-sm text-foreground/50">
        Failed to load this page, please try again.
        <br />
        页面加载失败，请稍后重试。
      </p>
      <button className="btn-primary" onClick={reset}>
        Retry / 重试
      </button>
    </div>
  );
}
