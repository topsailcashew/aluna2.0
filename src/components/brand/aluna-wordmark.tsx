import { AlunaMark } from "@/components/brand/aluna-mark";
import { cn } from "@/lib/utils";

/**
 * The mark beside the name, in the display grotesque. For auth, splash, and
 * anywhere the product needs to introduce itself.
 */
export function AlunaWordmark({
  size = 34,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <AlunaMark size={size} title="Aluna" />
      <span className="font-display text-2xl text-ink">Aluna</span>
    </span>
  );
}
