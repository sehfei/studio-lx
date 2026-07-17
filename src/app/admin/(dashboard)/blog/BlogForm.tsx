"use client";

import Image from "next/image";
import { useActionState } from "react";
import { createPost, updatePost } from "./actions";
import { Spinner } from "@/components/ui/Spinner";
import type { BlogPost } from "@/lib/blog";
import type { AdminDictionary } from "@/lib/i18n/admin";

const inputClass = "input-theme";
const labelClass = "mb-1 block text-xs tracking-widest text-foreground/50 uppercase";

export function BlogForm({
  post,
  dict,
  common,
}: {
  post?: BlogPost;
  dict: AdminDictionary["pages"]["blog"];
  common: AdminDictionary["common"];
}) {
  const f = dict.form;
  const action = post ? updatePost.bind(null, post.id) : createPost;
  const [state, formAction, pending] = useActionState(action, undefined);
  const v = state?.values;

  return (
    <form action={formAction} className="max-w-2xl space-y-6">
      {state?.error && (
        <p className="border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {state.error}
        </p>
      )}

      <div>
        <label className={labelClass}>{f.titleLabel} *</label>
        <input
          name="title"
          required
          className={inputClass}
          defaultValue={v ? v.title : post?.title}
        />
      </div>

      <div>
        <label className={labelClass}>{common.slugHint}</label>
        <input
          name="slug"
          className={inputClass}
          defaultValue={v ? v.slug : post?.slug}
        />
      </div>

      <div>
        <label className={labelClass}>{f.excerptLabel}</label>
        <textarea
          name="excerpt"
          rows={2}
          className={inputClass}
          defaultValue={v ? v.excerpt : post?.excerpt}
        />
      </div>

      <div>
        <label className={labelClass}>{f.contentLabel}</label>
        <textarea
          name="content"
          rows={10}
          className={inputClass}
          defaultValue={v ? v.content : post?.content}
        />
      </div>

      {post?.coverImage && (
        <div>
          <label className={labelClass}>{f.existingCoverImage}</label>
          <span className="relative block h-32 w-48 overflow-hidden border border-border-subtle">
            <Image src={post.coverImage} alt="" fill className="object-cover" />
          </span>
        </div>
      )}

      <div>
        <label className={labelClass}>
          {post ? f.replaceCoverImage : f.coverImageLabel} {f.coverImageHint}
        </label>
        <input
          type="file"
          name="coverImage"
          accept="image/jpeg,image/png,image/webp"
          className={`${inputClass} file:mr-4 file:border-0 file:bg-foreground file:px-3 file:py-1.5 file:text-xs file:text-background`}
        />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="isPublished"
          defaultChecked={v ? v.isPublished : (post?.isPublished ?? true)}
        />
        {f.publishedLabel}
      </label>

      <button type="submit" className="btn-primary" disabled={pending}>
        {pending && <Spinner size="sm" />}
        {pending ? common.saving : post ? f.saveButton : f.createButton}
      </button>
    </form>
  );
}
