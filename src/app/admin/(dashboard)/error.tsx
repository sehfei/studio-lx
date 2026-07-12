"use client";

export default function AdminError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="py-16 text-center">
      <h1 className="mb-4 text-lg font-semibold">后台出错了</h1>
      <p className="mb-8 text-sm text-foreground/50">{error.message}</p>
      <button className="btn-primary" onClick={reset}>
        重试
      </button>
    </div>
  );
}
