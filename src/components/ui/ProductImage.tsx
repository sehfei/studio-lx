import Image from "next/image";
import { PlaceholderImage } from "./PlaceholderImage";

export function ProductImage({
  src,
  label,
  className = "",
}: {
  src?: string;
  label: string;
  className?: string;
}) {
  if (!src) {
    return <PlaceholderImage label={label} className={className} />;
  }

  return (
    <div className={`relative aspect-[3/4] w-full overflow-hidden ${className}`}>
      <Image
        src={src}
        alt={label}
        fill
        className="object-cover"
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
      />
    </div>
  );
}
