"use client";

import { useState } from "react";
import Image from "next/image";

type UploadedFile = { name: string; url: string };

export default function ProductUploadPage() {
  const [uploaded, setUploaded] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError(null);

    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();

        if (!res.ok) {
          setError(data.error ?? "上传失败");
          continue;
        }

        setUploaded((prev) => [...prev, { name: file.name, url: data.url }]);
      } catch {
        setError("上传失败，请重试");
      }
    }

    setUploading(false);
    e.target.value = "";
  }

  return (
    <div>
      <h1 className="mb-2 text-lg font-medium">Upload Product Image</h1>
      <p className="mb-8 text-sm text-foreground/50">
        测试图片上传流程。当前存储在服务器本地 public/uploads/ 目录，接入
        Supabase Storage 后会换成云端存储。
      </p>

      <label className="flex cursor-pointer flex-col items-center justify-center border border-dashed border-border-subtle p-12 text-sm text-foreground/60 hover:border-gold hover:text-gold">
        {uploading ? "上传中..." : "点击选择图片（可多选）"}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          className="hidden"
          onChange={handleFileChange}
          disabled={uploading}
        />
      </label>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      {uploaded.length > 0 && (
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {uploaded.map((file) => (
            <div key={file.url} className="text-center">
              <div className="relative aspect-square w-full overflow-hidden border border-border-subtle">
                <Image
                  src={file.url}
                  alt={file.name}
                  fill
                  className="object-cover"
                />
              </div>
              <p className="mt-2 truncate text-xs text-foreground/50">
                {file.name}
              </p>
              <p className="truncate text-xs text-foreground/40">
                {file.url}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
