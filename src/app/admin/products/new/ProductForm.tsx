"use client";

import { useActionState } from "react";
import { createProduct } from "../actions";

const genders = [
  { value: "women", label: "Women" },
  { value: "men", label: "Men" },
];

const categories = [
  { value: "clothing", label: "Clothing" },
  { value: "shoes", label: "Shoes" },
  { value: "bags", label: "Bags" },
  { value: "glasses", label: "Glasses" },
  { value: "accessories", label: "Accessories" },
];

const tagOptions = [
  { value: "new-arrival", label: "New Arrival" },
  { value: "best-seller", label: "Best Seller" },
  { value: "promotion", label: "Promotion" },
];

const inputClass =
  "w-full border border-border-subtle px-3 py-2 text-sm outline-none focus:border-gold";
const labelClass = "mb-1 block text-xs tracking-widest text-foreground/50 uppercase";

export function ProductForm() {
  const [state, formAction, pending] = useActionState(
    createProduct,
    undefined,
  );

  return (
    <form action={formAction} className="max-w-2xl space-y-6">
      {state?.error && (
        <p className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Product Name *</label>
          <input name="name" required className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Slug（留空自动生成）</label>
          <input name="slug" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>SKU *</label>
          <input name="sku" required className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Brand *</label>
          <input name="brand" required className={inputClass} />
        </div>
      </div>

      <div>
        <label className={labelClass}>Description</label>
        <textarea name="description" rows={3} className={inputClass} />
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
          />
        </div>
        <div>
          <label className={labelClass}>Stock</label>
          <input
            name="stock"
            type="number"
            min="0"
            defaultValue={0}
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Gender *</label>
          <select name="gender" required className={inputClass} defaultValue="">
            <option value="" disabled>
              选择 Gender
            </option>
            {genders.map((g) => (
              <option key={g.value} value={g.value}>
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
            defaultValue=""
          >
            <option value="" disabled>
              选择 Category
            </option>
            {categories.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Colors（逗号分隔，如 Black,White）</label>
          <input name="colors" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Sizes（逗号分隔，如 S,M,L）</label>
          <input name="sizes" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Material</label>
          <input name="material" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Weight</label>
          <input name="weight" className={inputClass} placeholder="0.5kg" />
        </div>
      </div>

      <div>
        <label className={labelClass}>Images（可多选，JPEG/PNG/WEBP/GIF，单张最大5MB）</label>
        <input
          type="file"
          name="images"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          className={`${inputClass} file:mr-4 file:border-0 file:bg-foreground file:px-3 file:py-1.5 file:text-xs file:text-background`}
        />
      </div>

      <div>
        <label className={labelClass}>Shipping Info</label>
        <input
          name="shippingInfo"
          className={inputClass}
          placeholder="西马 2-4 工作日，东马 4-7 工作日"
        />
      </div>

      <div>
        <label className={labelClass}>Tags</label>
        <div className="flex gap-4 text-sm">
          {tagOptions.map((tag) => (
            <label key={tag.value} className="flex items-center gap-2">
              <input type="checkbox" name="tags" value={tag.value} />
              {tag.label}
            </label>
          ))}
        </div>
      </div>

      <button type="submit" className="btn-primary" disabled={pending}>
        {pending ? "保存中..." : "Create Product"}
      </button>
    </form>
  );
}
