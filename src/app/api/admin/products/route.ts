import { requirePermissionApi } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { slugify } from "@/lib/slugify";
import { mapRow } from "@/lib/products";
import {
  productInputToRow,
  uniqueViolationMessage,
  validateProduct,
} from "@/lib/validation/product";
import { badRequest, fail, ok, unauthorized } from "@/lib/api/response";

// POST /api/admin/products 创建商品（JSON body，images 传已上传好的 URL 数组）
export async function POST(request: Request) {
  const user = await requirePermissionApi("products");
  if (!user) return unauthorized();

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return badRequest("请求体必须是合法 JSON");
  }

  const { data: categoryRows } = await supabaseAdmin
    .from("categories")
    .select("slug");
  const validated = validateProduct(
    body,
    (categoryRows ?? []).map((c) => c.slug),
  );
  if (validated.error !== undefined) {
    return badRequest(validated.error);
  }
  const input = validated.data;

  const slugInput = typeof body.slug === "string" ? body.slug.trim() : "";
  const slug = slugify(slugInput || input.name);

  const images = Array.isArray(body.images)
    ? body.images.map(String).filter(Boolean)
    : [];

  const { data, error } = await supabaseAdmin
    .from("products")
    .insert(productInputToRow(input, slug, images))
    .select()
    .single();

  if (error) {
    const conflict = uniqueViolationMessage(error);
    if (conflict) return fail(409, "conflict", conflict);
    return fail(500, "internal_error", error.message);
  }

  return ok(mapRow(data), 201);
}
