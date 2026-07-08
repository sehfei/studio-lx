export function ComingSoon({ title }: { title: string }) {
  return (
    <div className="border border-dashed border-border-subtle p-12 text-center">
      <h1 className="mb-2 text-lg font-medium">{title}</h1>
      <p className="text-sm text-foreground/50">此模块开发中，敬请期待。</p>
    </div>
  );
}
