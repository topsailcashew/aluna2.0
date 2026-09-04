/* eslint-disable @next/next/no-img-element */
import { cn } from "@/lib/utils";

interface AvatarProps {
  /** Data URL of an uploaded picture, or empty for the colour fallback. */
  url?: string;
  color?: string;
  name?: string | null;
  className?: string;
  /** Tailwind text size for the initial. */
  textClassName?: string;
}

/**
 * Picture if there is one, otherwise the first letter on a chosen colour.
 *
 * Uses a plain <img> rather than next/image: the source is a data URL held in
 * Firestore, so there is nothing for the image optimiser to fetch or cache.
 */
export function Avatar({
  url,
  color = "#164452",
  name,
  className,
  textClassName = "text-lg",
}: AvatarProps) {
  const initial = (name?.trim()?.[0] ?? "A").toUpperCase();

  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center overflow-hidden rounded-2xl",
        className,
      )}
      style={url ? undefined : { backgroundColor: color }}
    >
      {url ? (
        <img
          src={url}
          alt=""
          className="size-full object-cover"
          draggable={false}
        />
      ) : (
        <span className={cn("font-extrabold text-white", textClassName)}>
          {initial}
        </span>
      )}
    </span>
  );
}
