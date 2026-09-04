"use client";

import { useState } from "react";
import { KeyRound, TriangleAlert } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { changePassword, deleteAccount } from "@/lib/firebase/account";
import { authErrorMessage, useAuth } from "@/lib/firebase/auth-context";
import type { User } from "firebase/auth";

const CONFIRM_WORD = "delete";

export function PasswordSection({ user }: { user: User }) {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  const reset = () => {
    setCurrent("");
    setNext("");
    setConfirm("");
  };

  const submit = async () => {
    if (next.length < 8) {
      toast.error("Use at least 8 characters.");
      return;
    }
    if (next !== confirm) {
      toast.error("The new passwords do not match.");
      return;
    }

    setBusy(true);
    try {
      await changePassword(user, current, next);
      toast.success("Password changed");
      reset();
      setOpen(false);
    } catch (error) {
      toast.error(authErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-3 text-left"
      >
        <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-surface-sunken text-ink-muted">
          <KeyRound className="size-4.5" aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-base font-bold text-ink">
            Change password
          </span>
          <span className="block text-xs text-ink-muted">
            You will be asked for your current one
          </span>
        </span>
      </button>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-base font-bold text-ink">Change password</p>
      <Input
        label="Current password"
        type="password"
        autoComplete="current-password"
        value={current}
        onChange={(event) => setCurrent(event.target.value)}
      />
      <Input
        label="New password"
        type="password"
        autoComplete="new-password"
        hint="At least 8 characters"
        value={next}
        onChange={(event) => setNext(event.target.value)}
      />
      <Input
        label="Confirm new password"
        type="password"
        autoComplete="new-password"
        value={confirm}
        onChange={(event) => setConfirm(event.target.value)}
      />
      <div className="flex gap-2">
        <Button onClick={submit} loading={busy} fullWidth>
          Update password
        </Button>
        <Button
          variant="secondary"
          onClick={() => {
            reset();
            setOpen(false);
          }}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}

export function DangerSection({ user }: { user: User }) {
  const { signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    try {
      await deleteAccount(user, password);
      toast.success("Your account and every entry have been deleted.");
      // The auth user is already gone; this just clears local state.
      await signOut().catch(() => {});
    } catch (error) {
      toast.error(authErrorMessage(error));
      setBusy(false);
    }
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-3 text-left"
      >
        <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-[#fdecea] text-[#c0463c] dark:bg-[#3a201d] dark:text-[#f3b8b1]">
          <TriangleAlert className="size-4.5" aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-base font-bold text-ink">
            Delete account
          </span>
          <span className="block text-xs text-ink-muted">
            Removes every check-in, permanently
          </span>
        </span>
      </button>
    );
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <p className="text-base font-bold text-ink">Delete account</p>
        <p className="text-xs leading-relaxed text-ink-muted">
          This deletes every check-in you have written and then removes the
          account itself. It cannot be undone, and there is no copy — export
          your data first if you want to keep it.
        </p>
      </div>
      <Input
        label="Your password"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />
      <Input
        label={`Type "${CONFIRM_WORD}" to confirm`}
        value={typed}
        autoComplete="off"
        onChange={(event) => setTyped(event.target.value)}
      />
      <div className="flex gap-2">
        <Button
          variant="danger"
          onClick={submit}
          loading={busy}
          disabled={typed.trim().toLowerCase() !== CONFIRM_WORD || !password}
          fullWidth
        >
          Delete everything
        </Button>
        <Button
          variant="secondary"
          onClick={() => {
            setOpen(false);
            setPassword("");
            setTyped("");
          }}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
