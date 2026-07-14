import { test, expect } from "@playwright/test";
import { supabaseAdmin } from "./env";

const CUSTOMER_EMAIL = "e2e-checkout-test@studiolx.com";
const PASSWORD = "TestPass123!";
const PRODUCT_SKU = "E2E-CHECKOUT-SKU";

let customerId: string;
let productId: string;
let productSlug: string;
let orderId: string | undefined;

test.beforeAll(async () => {
  const customer = await supabaseAdmin.auth.admin.createUser({
    email: CUSTOMER_EMAIL,
    password: PASSWORD,
    email_confirm: true,
  });
  if (customer.error || !customer.data.user) throw customer.error;
  customerId = customer.data.user.id;

  productSlug = `e2e-checkout-product-${Date.now()}`;
  const { data: product, error: productError } = await supabaseAdmin
    .from("products")
    .insert({
      name: "E2E Checkout Product",
      slug: productSlug,
      sku: PRODUCT_SKU,
      brand: "E2E Brand",
      price: 49.9,
      stock: 5,
      images: [],
      colors: [],
      sizes: [],
      material: "test",
      weight: "1kg",
      shipping_info: "test",
      gender: "women",
      category: "clothing",
      tags: [],
      description: "e2e checkout test product",
    })
    .select("id")
    .single();
  if (productError || !product) throw productError;
  productId = product.id;
});

test.afterAll(async () => {
  if (orderId) {
    await supabaseAdmin.from("order_items").delete().eq("order_id", orderId);
    await supabaseAdmin.from("orders").delete().eq("id", orderId);
  }
  if (productId) await supabaseAdmin.from("products").delete().eq("id", productId);
  if (customerId) await supabaseAdmin.auth.admin.deleteUser(customerId);
});

test("注册/登录顾客走完整下单流程,看到订单确认页", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("textbox", { name: "Email" }).fill(CUSTOMER_EMAIL);
  await page.getByRole("textbox", { name: "Password" }).fill(PASSWORD);
  await page.getByRole("button", { name: "Login" }).click();
  await expect(page).toHaveURL("/account");

  await page.goto(`/product/${productSlug}`);
  await page.getByRole("button", { name: "Buy Now" }).click();
  await expect(page).toHaveURL("/checkout");

  await page.getByRole("textbox", { name: "Full Name" }).fill("E2E Checkout Test");
  await page.getByRole("textbox", { name: "Phone Number" }).fill("0123456789");
  await page.getByRole("textbox", { name: "Address" }).fill("123 E2E Street");
  await page.getByRole("textbox", { name: "City" }).fill("Kuala Lumpur");
  await page.locator("select").selectOption("WP Kuala Lumpur");
  await page.getByRole("textbox", { name: "Postcode" }).fill("50000");
  await page.getByRole("button", { name: "Place Order" }).click();

  await expect(page).toHaveURL(/\/checkout\/success\?order=/);
  await expect(page.getByText("Order Placed!")).toBeVisible();

  const url = new URL(page.url());
  orderId = url.searchParams.get("order") ?? undefined;
  expect(orderId).toBeTruthy();
});
