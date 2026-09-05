import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto grid min-h-dvh max-w-md place-items-center px-5">
      <div className="space-y-4 text-center">
        <p className="text-xs font-bold tracking-[0.14em] text-deep-500 uppercase">
          Not found
        </p>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink">
          There is nothing at this address
        </h1>
        <p className="text-sm text-ink-muted">
          The link may be old, or mistyped.
        </p>
        <Link
          href="/dashboard"
          className="inline-block rounded-2xl bg-deep-700 px-5 py-3 text-sm font-bold text-white"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}
