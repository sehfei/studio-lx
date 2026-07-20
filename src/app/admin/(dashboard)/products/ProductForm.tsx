"use client";

import Image from "next/image";
import { useActionState, useRef, useState } from "react";
import { createProduct, updateProduct } from "./actions";
import { TAGS } from "@/lib/constants";
import { Spinner } from "@/components/ui/Spinner";
import type { Product, ProductImage as ProductImageType } from "@/lib/products";
import type { CategoryRow } from "@/lib/categories";
import type { GenderRow } from "@/lib/genders";
import type { SubcategoryRow } from "@/lib/subcategories";
import type { AdminDictionary } from "@/lib/i18n/admin";

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
  subcategories,
  dict,
  common,
}: {
  product?: Product;
  categories: CategoryRow[];
  genders: GenderRow[];
  subcategories: SubcategoryRow[];
  dict: AdminDictionary["pages"]["products"];
  common: AdminDictionary["common"];
}) {
  const f = dict.form;
  const action = product ? updateProduct.bind(null, product.id) : createProduct;
  const [state, formAction, pending] = useActionState(action, undefined);
  // 提交报错时用返回的原始值回填，避免 React 19 重置表单清空所填内容
  const v = state?.values;

  // 子分类下拉跟着当前选的分类联动过滤，所以 category 要是受控的
  const [selectedCategory, setSelectedCategory] = useState(
    v ? v.category : (product?.category ?? ""),
  );
  const availableSubcategories = subcategories.filter(
    (s) => s.category === selectedCategory,
  );

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

  // 现有图片的顺序：长按缩略图拖到另一张上面就互换位置，第一张是封面图。
  // key 用 img.url（不是数组下标），拖动重排时 React 靠 key 认出同一张图，
  // 已经手动改过的 alt text 不会因为重排而丢失。
  const [existingImages, setExistingImages] = useState<ProductImageType[]>(
    product?.images ?? [],
  );
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleThumbPointerDown(
    e: React.PointerEvent<HTMLElement>,
    index: number,
  ) {
    const el = e.currentTarget;
    const pointerId = e.pointerId;
    const begin = () => {
      el.setPointerCapture(pointerId);
      setDragIndex(index);
      setOverIndex(index);
    };
    if (e.pointerType === "touch") {
      longPressTimer.current = setTimeout(begin, 350);
    } else {
      begin();
    }
  }

  function handleThumbPointerMove(e: React.PointerEvent) {
    if (dragIndex === null) return;
    const el = document.elementFromPoint(e.clientX, e.clientY);
    const target = el?.closest<HTMLElement>("[data-image-index]");
    if (target) {
      const idx = Number(target.dataset.imageIndex);
      if (!Number.isNaN(idx)) setOverIndex(idx);
    }
  }

  function handleThumbPointerUp() {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    if (dragIndex !== null && overIndex !== null && dragIndex !== overIndex) {
      setExistingImages((prev) => {
        const next = [...prev];
        const [moved] = next.splice(dragIndex, 1);
        next.splice(overIndex, 0, moved);
        return next;
      });
    }
    setDragIndex(null);
    setOverIndex(null);
  }

  return (
    <form action={formAction} className="max-w-2xl space-y-6">
      {state?.error && (
        <p className="border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {state.error}
        </p>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>{f.nameLabel} *</label>
          <input
            name="name"
            required
            className={inputClass}
            defaultValue={v ? v.name : product?.name}
          />
        </div>
        <div>
          <label className={labelClass}>{common.slugHint}</label>
          <input name="slug" className={inputClass} defaultValue={v ? v.slug : product?.slug} />
        </div>
        <div>
          <label className={labelClass}>{f.skuLabel} *</label>
          <input
            name="sku"
            required
            className={inputClass}
            defaultValue={v ? v.sku : product?.sku}
          />
        </div>
        <div>
          <label className={labelClass}>{f.brandLabel} *</label>
          <input
            name="brand"
            required
            className={inputClass}
            defaultValue={v ? v.brand : product?.brand}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>{f.descriptionLabel}</label>
        <textarea
          name="description"
          rows={3}
          className={inputClass}
          defaultValue={v ? v.description : product?.description}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className={labelClass}>{f.priceLabel} *</label>
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
          <label className={labelClass}>{f.discountPriceLabel}</label>
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
          <label className={labelClass}>{f.stockLabel}</label>
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
          <label className={labelClass}>{f.genderLabel} *</label>
          <select
            name="gender"
            required
            className={inputClass}
            defaultValue={v ? v.gender : (product?.gender ?? "")}
          >
            <option value="" disabled>
              {f.selectGender}
            </option>
            {genders.map((g) => (
              <option key={g.slug} value={g.slug}>
                {g.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>{f.categoryLabel} *</label>
          <select
            name="category"
            required
            className={inputClass}
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="" disabled>
              {f.selectCategory}
            </option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>{f.subcategoryLabel}</label>
          <select
            name="subcategory"
            className={inputClass}
            defaultValue={v ? v.subcategory : (product?.subcategory ?? "")}
            disabled={availableSubcategories.length === 0}
          >
            <option value="">
              {availableSubcategories.length === 0
                ? f.noSubcategories
                : f.dontAssignSubcategory}
            </option>
            {availableSubcategories.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>{f.colorsLabel}</label>
          <input
            name="colors"
            className={inputClass}
            defaultValue={v ? v.colors : product?.colors.join(",")}
          />
        </div>
        <div>
          <label className={labelClass}>{f.sizesLabel}</label>
          <input
            name="sizes"
            className={inputClass}
            defaultValue={v ? v.sizes : product?.sizes.join(",")}
          />
        </div>
        <div>
          <label className={labelClass}>{f.materialLabel}</label>
          <input
            name="material"
            className={inputClass}
            defaultValue={v ? v.material : product?.material}
          />
        </div>
        <div>
          <label className={labelClass}>{f.weightLabel}</label>
          <input
            name="weight"
            className={inputClass}
            placeholder="0.5kg"
            defaultValue={v ? v.weight : product?.weight}
          />
        </div>
      </div>

      {existingImages.length > 0 && (
        <div>
          <label className={labelClass}>{f.existingImages}</label>
          <p className="mb-2 text-xs text-foreground/40">{f.reorderHint}</p>
          <div className="flex flex-wrap gap-4">
            {existingImages.map((img, i) => (
              <div key={img.url} className="w-28 text-center">
                <span
                  data-image-index={i}
                  onPointerDown={(e) => handleThumbPointerDown(e, i)}
                  onPointerMove={handleThumbPointerMove}
                  onPointerUp={handleThumbPointerUp}
                  onPointerCancel={handleThumbPointerUp}
                  className={`relative block h-24 w-24 touch-none overflow-hidden border select-none ${
                    dragIndex === i
                      ? "cursor-grabbing opacity-40"
                      : overIndex === i && dragIndex !== null
                        ? "cursor-grabbing border-gold"
                        : "cursor-grab border-border-subtle"
                  }`}
                >
                  <Image
                    src={img.url}
                    alt=""
                    fill
                    draggable={false}
                    className="object-cover"
                  />
                  {i === 0 && (
                    <span className="absolute left-1 top-1 bg-background/80 px-1.5 py-0.5 text-[10px] tracking-widest uppercase">
                      {f.coverLabel}
                    </span>
                  )}
                </span>
                <input type="hidden" name="existingImageUrl" value={img.url} />
                <input
                  type="text"
                  name="existingImageAlt"
                  defaultValue={img.alt}
                  placeholder={f.altTextPlaceholder}
                  className="mt-1 w-full border border-border-subtle px-1 py-1 text-xs"
                />
                <label className="mt-1 flex items-center justify-center gap-1 text-xs text-destructive">
                  <input type="checkbox" name="removeImages" value={img.url} />
                  {common.delete}
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <label className={labelClass}>
          {product ? f.imagesLabelAppend : f.imagesLabelNew} {f.imagesHint}
        </label>
        <input
          type="file"
          name="images"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          onChange={handleFilesChange}
          className={`${inputClass} file:mr-4 file:border-0 file:bg-foreground file:px-3 file:py-1.5 file:text-xs file:text-background`}
        />
        <p className="mt-1 text-xs text-foreground/40">{f.altTextHint}</p>
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
                  placeholder={f.altTextPlaceholder}
                  className="mt-1 w-full border border-border-subtle px-1 py-1 text-xs"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <label className={labelClass}>{f.badgeLabel}</label>
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
        <label className={labelClass}>{f.shippingInfoLabel}</label>
        <input
          name="shippingInfo"
          className={inputClass}
          placeholder="e.g. 2-4 business days"
          defaultValue={v ? v.shippingInfo : product?.shippingInfo}
        />
      </div>

      <div>
        <label className={labelClass}>{f.tagsLabel}</label>
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
          ? common.saving
          : product
            ? f.saveButton
            : f.createButton}
      </button>
    </form>
  );
}
