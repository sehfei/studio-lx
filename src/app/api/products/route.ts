import type { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { mapRow, type ProductRow } from "@/lib/products";
import { TAGS } from "@/lib/constants";
import { getCategories } from "@/lib/categories";
import { getGenders } from "@/lib/genders";
import { badRequest, ok, serverError, tooManyRequests } from "@/lib/api/response";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const MAX_LIMIT = 50;

// GET /api/products?gender=&category=&tag=&page=&limit=
// 公开只读接口，走 anon key（受 RLS 限制，只能查）
export async function GET(request: NextRequest) {
  const ip = await getClientIp();
  const { allowed } = await checkRateLimit(`api:products:${ip}`, 60, 60);
  if (!allowed) return tooManyRequests();

  const params = request.nextUrl.searchParams;

  const gender = params.get("gender");
  if (gender) {
    const validGenderSlugs = (await getGenders()).map((g) => g.slug);
    if (!validGenderSlugs.includes(gender)) {
      return badRequest(`gender 只能是 ${validGenderSlugs.join(" / ")}`);
    }
  }

  const category = params.get("category");
  if (category) {
    const validSlugs = (await getCategories()).map((c) => c.slug);
    if (!validSlugs.includes(category)) {
      return badRequest(`category 只能是 ${validSlugs.join(" / ")}`);
    }
  }

  const tag = params.get("tag");
  if (tag && !(TAGS as readonly string[]).includes(tag)) {
    return badRequest(`tag 只能是 ${TAGS.join(" / ")}`);
  }

  const page = Math.max(1, Number(params.get("page") ?? 1) || 1);
  const limit = Math.min(
    MAX_LIMIT,
    Math.max(1, Number(params.get("limit") ?? 20) || 20),
  );
  const from = (page - 1) * limit;

  let query = supabase
    .from("products")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, from + limit - 1);

  if (gender) query = query.eq("gender", gender);
  if (category) query = query.eq("category", category);
  if (tag) query = query.contains("tags", [tag]);

  const { data, error, count } = await query;
  if (error) {
    return serverError(error.message);
  }

  return ok({
    items: ((data ?? []) as ProductRow[]).map(mapRow),
    page,
    limit,
    total: count ?? 0,
  });
}
