import { requirePermissionApi } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { mapRow, type ProductRow } from "@/lib/products";
import {
  parseImagesInput,
  productInputToRow,
  uniqueViolationMessage,
  validateProduct,
} from "@/lib/validation/product";
import {
  badRequest,
  fail,
  forbiddenOrigin,
  notFound,
  ok,
  tooManyRequests,
  unauthorized,
} from "@/lib/api/response";
import { checkRateLimit } from "@/lib/rate-limit";
import { isCrossOriginRequest } from "@/lib/api/origin-check";

type RouteContext = { params: Promise<{ id: string }> };

async function findRow(id: string): Promise<ProductRow | null> {
  const { data } = await supabaseAdmin
    .from("products")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return data;
}

// PATCH /api/admin/products/[id] 部分更新：
// 先取现有行，和 body 合并后整体校验，保证折扣价 < 原价这类跨字段规则不被绕过
export async function PATCH(request: Request, { params }: RouteContext) {
  const user = await requirePermissionApi("products");
  if (!user) return unauthorized();

  if (isCrossOriginRequest(request)) return forbiddenOrigin();

  const { allowed } = await checkRateLimit(`api:admin:${user.id}`, 60, 60);
  if (!allowed) return tooManyRequests();

  const { id } = await params;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return badRequest("请求体必须是合法 JSON");
  }

  const existing = await findRow(id);
  if (!existing) return notFound("商品不存在");

  const current = mapRow(existing);
  const merged = {
    name: body.name ?? current.name,
    sku: body.sku ?? current.sku,
    brand: body.brand ?? current.brand,
    description: body.description ?? current.description,
    price: body.price ?? current.price,
    // 允许显式传 null 清掉折扣价
    discountPrice:
      "discountPrice" in body ? body.discountPrice : (current.discountPrice ?? null),
    stock: body.stock ?? current.stock,
    colors: body.colors ?? current.colors,
    sizes: body.sizes ?? current.sizes,
    material: body.material ?? current.material,
    weight: body.weight ?? current.weight,
    shippingInfo: body.shippingInfo ?? current.shippingInfo,
    gender: body.gender ?? current.gender,
    category: body.category ?? current.category,
    subcategory:
      "subcategory" in body ? body.subcategory : (current.subcategory ?? null),
    tags: body.tags ?? current.tags,
    badgeText:
      "badgeText" in body ? body.badgeText : (current.badgeText ?? null),
  };

  const [{ data: categoryRows }, { data: genderRows }, { data: subcategoryRows }] =
    await Promise.all([
      supabaseAdmin.from("categories").select("slug"),
      supabaseAdmin.from("genders").select("slug"),
      supabaseAdmin.from("subcategories").select("slug, category"),
    ]);
  const validated = validateProduct(
    merged,
    (categoryRows ?? []).map((c) => c.slug),
    (genderRows ?? []).map((g) => g.slug),
    subcategoryRows ?? [],
  );
  if (validated.error !== undefined) {
    return badRequest(validated.error);
  }

  const images = "images" in body
    ? parseImagesInput(body.images, merged.name as string)
    : current.images;

  const row = productInputToRow(validated.data, current.slug, images);

  const { data, error } = await supabaseAdmin
    .from("products")
    .update(row)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    const conflict = uniqueViolationMessage(error);
    if (conflict) return fail(409, "conflict", conflict);
    return fail(500, "internal_error", error.message);
  }

  return ok(mapRow(data));
}

// DELETE /api/admin/products/[id]
export async function DELETE(request: Request, { params }: RouteContext) {
  const user = await requirePermissionApi("products");
  if (!user) return unauthorized();

  if (isCrossOriginRequest(request)) return forbiddenOrigin();

  const { allowed } = await checkRateLimit(`api:admin:${user.id}`, 60, 60);
  if (!allowed) return tooManyRequests();

  const { id } = await params;

  const existing = await findRow(id);
  if (!existing) return notFound("商品不存在");

  const { error } = await supabaseAdmin.from("products").delete().eq("id", id);
  if (error) {
    return fail(500, "internal_error", error.message);
  }

  return ok({ id });
}
