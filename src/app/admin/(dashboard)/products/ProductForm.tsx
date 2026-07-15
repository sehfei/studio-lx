"use client";

import Image from "next/image";
import { useActionState, useState } from "react";
import { createProduct, updateProduct } from "./actions";
import { TAGS } from "@/lib/constants";
import { Spinner } from "@/components/ui/Spinner";
import type { Product } from "@/lib/products";
import type { CategoryRow } from "@/lib/categories";
import type { GenderRow } from "@/lib/genders";

// 展示名：首字母大写，连字符转空格（new-arrival -> New Arrival）
function toLabel(value: string): string {
  return value
    .split("-")
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
}

const tagOptions = TAGS.map((value) => ({ value, label: toLabel(value) }));

const inputClass = "input-theme";
const labelClass = "mb-1 block text-xs tracking-widest text-foreground/50 uppercase";

// 不传 product 是新增，传了就是编辑
export function ProductForm({
  product,
  categories,
  genders,
}: {
  product?: Product;
  categories: CategoryRow[];
  genders: GenderRow[];
}) {
  const action = product ? updateProduct.bind(null, product.id) : createProduct;
  const [state, formAction, pending] = useActionState(action, undefined);
  // 提交报错时用返回的原始值回填，避免 React 19 重置表单清空所填内容
  const v = state?.values;

  // 新选中的图片文件：本地预览 + 逐张填 alt 文字，提交时跟文件顺序一一对应
  const [newImages, setNewImages] = useState<
    { file: File; previewUrl: string; alt: string }[]
  >([]);
  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    setNewImages(
      files.map((file) => ({
        file,
        previewUrl: URL.createObjectURL(file),
        alt: "",
      })),
    );
  };

  return (
    <form action={formAction} className="max-w-2xl space-y-6">
      {state?.error && (
        <p className="border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {state.error}
        </p>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Product Name *</label>
          <input
            name="name"
            required
            className={inputClass}
            defaultValue={v ? v.name : product?.name}
          />
        </div>
        <div>
          <label className={labelClass}>Slug（留空自动生成）</label>
          <input name="slug" className={inputClass} defaultValue={v ? v.slug : product?.slug} />
        </div>
        <div>
          <label className={labelClass}>SKU *</label>
          <input
            name="sku"
            required
            className={inputClass}
            defaultValue={v ? v.sku : product?.sku}
          />
        </div>
        <div>
          <label className={labelClass}>Brand *</label>
          <input
            name="brand"
            required
            className={inputClass}
            defaultValue={v ? v.brand : product?.brand}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Description</label>
        <textarea
          name="description"
          rows={3}
          className={inputClass}
          defaultValue={v ? v.description : product?.description}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className={labelClass}>Price (RM) *</label>
          <input
            name="price"
            type="number"
            step="0.01"
            min="0"
            required
            className={inputClass}
            defaultValue={v ? v.price : product?.price}
          />
        </div>
        <div>
          <label className={labelClass}>Discount Price (RM)</label>
          <input
            name="discountPrice"
            type="number"
            step="0.01"
            min="0"
            className={inputClass}
            defaultValue={v ? v.discountPrice : product?.discountPrice}
          />
        </div>
        <div>
          <label className={labelClass}>Stock</label>
          <input
            name="stock"
            type="number"
            min="0"
            defaultValue={v ? v.stock : (product?.stock ?? 0)}
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Gender *</label>
          <select
            name="gender"
            required
            className={inputClass}
            defaultValue={v ? v.gender : (product?.gender ?? "")}
          >
            <option value="" disabled>
              选择 Gender
            </option>
            {genders.map((g) => (
              <option key={g.slug} value={g.slug}>
                {g.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Category *</label>
          <select
            name="category"
            required
            className={inputClass}
            defaultValue={v ? v.category : (product?.category ?? "")}
          >
            <option value="" disabled>
              选择 Category
            </option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Colors（逗号分隔，如 Black,White）</label>
          <input
            name="colors"
            className={inputClass}
            defaultValue={v ? v.colors : product?.colors.join(",")}
          />
        </div>
        <div>
          <label className={labelClass}>Sizes（逗号分隔，如 S,M,L）</label>
          <input
            name="sizes"
            className={inputClass}
            defaultValue={v ? v.sizes : product?.sizes.join(",")}
          />
        </div>
        <div>
          <label className={labelClass}>Material</label>
          <input
            name="material"
            className={inputClass}
            defaultValue={v ? v.material : product?.material}
          />
        </div>
        <div>
          <label className={labelClass}>Weight</label>
          <input
            name="weight"
            className={inputClass}
            placeholder="0.5kg"
            defaultValue={v ? v.weight : product?.weight}
          />
        </div>
      </div>

      {product && product.images.length > 0 && (
        <div>
          <label className={labelClass}>现有图片</label>
          <div className="flex flex-wrap gap-4">
            {product.images.map((img) => (
              <div key={img.url} className="w-28 text-center">
                <span className="relative block h-24 w-24 overflow-hidden border border-border-subtle">
                  <Image src={img.url} alt="" fill className="object-cover" />
                </span>
                <input type="hidden" name="existingImageUrl" value={img.url} />
                <input
                  type="text"
                  name="existingImageAlt"
                  defaultValue={img.alt}
                  placeholder="Alt text（图片描述）"
                  className="mt-1 w-full border border-border-subtle px-1 py-1 text-xs"
                />
                <label className="mt-1 flex items-center justify-center gap-1 text-xs text-destructive">
                  <input type="checkbox" name="removeImages" value={img.url} />
                  删除
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <label className={labelClass}>
          {product ? "追加图片" : "Images"}（可多选，JPEG/PNG/WEBP/GIF，单张最大5MB）
        </label>
        <input
          type="file"
          name="images"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          onChange={handleFilesChange}
          className={`${inputClass} file:mr-4 file:border-0 file:bg-foreground file:px-3 file:py-1.5 file:text-xs file:text-background`}
        />
        <p className="mt-1 text-xs text-foreground/40">
          每张图片建议填写 alt text（描述图片内容，比如"黑色羊毛大衣正面图"），对 SEO 和无障碍访问都有帮助。留空则用商品名称代替。
        </p>
        {newImages.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-4">
            {newImages.map((img, i) => (
              // eslint-disable-next-line react/no-array-index-key
              <div key={i} className="w-28 text-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.previewUrl}
                  alt=""
                  className="h-24 w-24 border border-border-subtle object-cover"
                />
                <input
                  type="text"
                  name="newImageAlts"
                  value={img.alt}
                  onChange={(e) =>
                    setNewImages((prev) =>
                      prev.map((p, idx) =>
                        idx === i ? { ...p, alt: e.target.value } : p,
                      ),
                    )
                  }
                  placeholder="Alt text（图片描述）"
                  className="mt-1 w-full border border-border-subtle px-1 py-1 text-xs"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <label className={labelClass}>Badge（可选，显示在商品图左上角）</label>
        <input
          name="badgeText"
          list="badge-suggestions"
          maxLength={20}
          placeholder="New / Hot / Sale / Out of Stock"
          className={inputClass}
          defaultValue={v ? v.badgeText : product?.badgeText}
        />
        <datalist id="badge-suggestions">
          <option value="New" />
          <option value="Hot" />
          <option value="Sale" />
          <option value="Limited" />
          <option value="Out of Stock" />
          <option value="Pre-order" />
        </datalist>
      </div>

      <div>
        <label className={labelClass}>Shipping Info</label>
        <input
          name="shippingInfo"
          className={inputClass}
          placeholder="西马 2-4 工作日，东马 4-7 工作日"
          defaultValue={v ? v.shippingInfo : product?.shippingInfo}
        />
      </div>

      <div>
        <label className={labelClass}>Tags</label>
        <div className="flex gap-4 text-sm">
          {tagOptions.map((tag) => (
            <label key={tag.value} className="flex items-center gap-2">
              <input
                type="checkbox"
                name="tags"
                value={tag.value}
                defaultChecked={v ? v.tags.includes(tag.value) : product?.tags.includes(tag.value)}
              />
              {tag.label}
            </label>
          ))}
        </div>
      </div>

      <button type="submit" className="btn-primary" disabled={pending}>
        {pending && <Spinner size="sm" />}
        {pending
          ? "保存中"
          : product
            ? "Save Changes"
            : "Create Product"}
      </button>
    </form>
  );
}
