"use client";

import { useState } from "react";
import { Lock, LogOut } from "lucide-react";
import { toast } from "sonner";

import { RecoveryPhrase } from "@/components/crypto/recovery-phrase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  createEnvelope,
  generatePhrase,
  phraseLooksValid,
  unknownPhraseWords,
  WrongSecretError,
} from "@/lib/crypto/keys";
import { useVault } from "@/lib/crypto/vault";
import { saveEnvelope } from "@/lib/firebase/envelope";
import { useAuth } from "@/lib/firebase/auth-context";

/**
 * Stands between a signed-in session and the app whenever the data key is not
 * in memory — which is every reload, because the key is never written to
 * storage. Asking for the password again is the visible cost of that choice.
 */
export function UnlockScreen() {
  const { signOut, user } = useAuth();
  const { unlockWithPassword, unlockWithPhrase } = useVault();

  const [mode, setMode] = useState<"password" | "phrase">("password");
  const [password, setPassword] = useState("");
  const [phrase, setPhrase] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    try {
      if (mode === "password") {
        await unlockWithPassword(password);
      } else {
        if (!phraseLooksValid(phrase)) {
          const unknown = unknownPhraseWords(phrase);
          toast.error(
            unknown.length
              ? `Not in the word list: ${unknown.slice(0, 3).join(", ")}`
              : "A recovery phrase is exactly twelve words.",
          );
          return;
        }
        await unlockWithPhrase(phrase);
        toast.success("Unlocked. Consider changing your password in Settings.");
      }
    } catch (error) {
      toast.error(
        error instanceof WrongSecretError
          ? error.message
          : "Could not unlock. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-5 py-10">
      <div className="space-y-6">
        <div className="space-y-3">
          <span className="grid size-11 place-items-center rounded-2xl bg-deep-50 text-deep-600 dark:bg-deep-900 dark:text-deep-200">
            <Lock className="size-5" aria-hidden />
          </span>
          <div className="space-y-1.5">
            <h1 className="text-2xl font-display text-ink">
              Unlock your entries
            </h1>
            <p className="text-sm leading-relaxed text-ink-muted">
              Your check-ins are encrypted with a key only you hold. It is never
              saved to this device, so it is needed again after every reload.
            </p>
          </div>
        </div>

        <div className="card space-y-4 p-5">
          {mode === "password" ? (
            <Input
              label="Password"
              type="password"
              autoComplete="current-password"
              autoFocus
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") void submit();
              }}
            />
          ) : (
            <Textarea
              label="Recovery phrase"
              value={phrase}
              autoFocus
              placeholder="The twelve words from when you signed up"
              onChange={(event) => setPhrase(event.target.value)}
            />
          )}

          <Button
            onClick={submit}
            loading={busy}
            size="lg"
            fullWidth
            disabled={mode === "password" ? !password : !phrase.trim()}
          >
            Unlock
          </Button>

          <button
            type="button"
            onClick={() => setMode(mode === "password" ? "phrase" : "password")}
            className="w-full text-center text-sm font-bold text-deep-600 underline-offset-4 hover:underline dark:text-deep-300"
          >
            {mode === "password"
              ? "Use my recovery phrase instead"
              : "Use my password instead"}
          </button>
        </div>

        <button
          type="button"
          onClick={() => void signOut()}
          className="mx-auto flex items-center gap-2 text-xs font-semibold text-ink-subtle transition-colors hover:text-ink"
        >
          <LogOut className="size-3.5" aria-hidden />
          Sign out of {user?.email}
        </button>
      </div>
    </main>
  );
}

/**
 * Only reachable if signup was interrupted between creating the account and
 * saving its key envelope. Rather than stranding the account, offer to set the
 * encryption up now — there are no entries yet, so nothing is lost.
 */
export function SetUpEncryptionScreen() {
  const { user, signOut } = useAuth();
  const { adopt } = useVault();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [phrase, setPhrase] = useState<string | null>(null);

  const create = async () => {
    if (!user) return;
    setBusy(true);
    try {
      const nextPhrase = generatePhrase();
      const { envelope, dataKey } = await createEnvelope(password, nextPhrase);
      await saveEnvelope(user.uid, envelope);
      adopt(dataKey, envelope);
      setPhrase(nextPhrase);
    } catch {
      toast.error("Could not set up encryption. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  if (phrase) {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-5 py-10">
        <RecoveryPhrase phrase={phrase} onConfirmed={() => location.reload()} />
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-5 py-10">
      <div className="space-y-6">
        <div className="space-y-1.5">
          <h1 className="text-2xl font-display text-ink">
            Finish setting up
          </h1>
          <p className="text-sm leading-relaxed text-ink-muted">
            This account has no encryption key yet — signup was probably
            interrupted. Confirm your password and we will create one. You have
            no entries, so nothing is lost.
          </p>
        </div>

        <div className="card space-y-4 p-5">
          <Input
            label="Your password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <Button
            onClick={create}
            loading={busy}
            disabled={!password}
            size="lg"
            fullWidth
          >
            Set up encryption
          </Button>
        </div>

        <button
          type="button"
          onClick={() => void signOut()}
          className="mx-auto block text-xs font-semibold text-ink-subtle hover:text-ink"
        >
          Sign out
        </button>
      </div>
    </main>
  );
}
