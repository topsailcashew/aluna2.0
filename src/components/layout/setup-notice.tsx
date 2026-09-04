import { KeyRound } from "lucide-react";

const KEYS = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
];

/**
 * Shown instead of a cryptic SDK crash when the app is running without
 * Firebase credentials.
 */
export function SetupNotice() {
  return (
    <main className="mx-auto grid min-h-dvh max-w-lg place-items-center px-5 py-10">
      <div className="card space-y-4 p-6">
        <span className="grid size-11 place-items-center rounded-2xl bg-deep-50 text-deep-600 dark:bg-deep-900 dark:text-deep-200">
          <KeyRound className="size-5" aria-hidden />
        </span>
        <div className="space-y-1.5">
          <h1 className="text-xl font-extrabold tracking-tight text-ink">
            Connect Aluna to Firebase
          </h1>
          <p className="text-sm leading-relaxed text-ink-muted">
            Aluna stores every check-in in your own Firebase project. Copy{" "}
            <code className="rounded bg-surface-sunken px-1.5 py-0.5 text-xs font-semibold">
              .env.local.example
            </code>{" "}
            to{" "}
            <code className="rounded bg-surface-sunken px-1.5 py-0.5 text-xs font-semibold">
              .env.local
            </code>
            , fill in the keys below, then restart the dev server.
          </p>
        </div>
        <ul className="space-y-1 rounded-2xl bg-surface-sunken p-3.5">
          {KEYS.map((key) => (
            <li
              key={key}
              className="font-mono text-[11px] leading-relaxed break-all text-ink-muted"
            >
              {key}
            </li>
          ))}
        </ul>
        <p className="text-xs leading-relaxed text-ink-subtle">
          Enable <strong className="text-ink-muted">Email/Password</strong> under
          Authentication, create a Firestore database, and deploy the rules in{" "}
          <code className="text-[11px]">firestore.rules</code>.
        </p>
      </div>
    </main>
  );
}
