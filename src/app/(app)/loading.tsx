import { RippleLoader } from "@/components/brand/ripple-loader";

export default function Loading() {
  return (
    <div className="grid min-h-[75vh] place-items-center">
      <RippleLoader label="One moment…" />
    </div>
  );
}
