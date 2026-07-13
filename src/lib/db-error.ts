// 42P01 = 表不存在，42703 = 列不存在，PGRST204/PGRST205 = PostgREST 找不到表/列
//（通常是 schema cache 还没刷新，或者迁移 SQL 还没跑），
// 都说明数据库结构还没更新，提示先跑迁移 SQL 而不是把原始报错甩给用户。
export function dbErrorMessage(error: { code?: string; message: string }): string {
  if (
    error.code === "42P01" ||
    error.code === "42703" ||
    error.code === "PGRST204" ||
    error.code === "PGRST205" ||
    /schema cache/i.test(error.message)
  ) {
    return "数据库结构还没更新，请先在 Supabase SQL Editor 执行最新的迁移 SQL";
  }
  return error.message;
}
