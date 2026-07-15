import { getProductBySlug } from "@/lib/products";
import { notFound, ok, serverError, tooManyRequests } from "@/lib/api/response";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

// GET /api/products/[slug] 公开只读
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const ip = await getClientIp();
  const { allowed } = await checkRateLimit(`api:products:${ip}`, 60, 60);
  if (!allowed) return tooManyRequests();

  const { slug } = await params;

  try {
    const product = await getProductBySlug(slug);
    if (!product) {
      return notFound("商品不存在");
    }
    return ok(product);
  } catch (e) {
    return serverError(e instanceof Error ? e.message : undefined);
  }
}
