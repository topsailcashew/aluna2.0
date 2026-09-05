"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { AuthShell } from "@/components/layout/auth-shell";
import { RecoveryPhrase } from "@/components/crypto/recovery-phrase";
import { SetupNotice } from "@/components/layout/setup-notice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createEnvelope, generatePhrase } from "@/lib/crypto/keys";
import { useVault } from "@/lib/crypto/vault";
import { saveEnvelope } from "@/lib/firebase/envelope";
import { authErrorMessage, useAuth } from "@/lib/firebase/auth-context";
import { signUpSchema, type SignUpValues } from "@/lib/schemas";

export default function SignUpPage() {
  const { signUp, configured } = useAuth();
  const { adopt } = useVault();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  /** Set once the account exists and its key is in memory. */
  const [phrase, setPhrase] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      displayName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  if (!configured) return <SetupNotice />;

  const onSubmit = handleSubmit(async (values) => {
    setSubmitting(true);
    try {
      const user = await signUp(values.displayName, values.email, values.password);

      // Generate and store the key envelope before anything can be written,
      // so an account can never exist with entries it has no key for.
      const nextPhrase = generatePhrase();
      const { envelope, dataKey } = await createEnvelope(
        values.password,
        nextPhrase,
      );
      await saveEnvelope(user.uid, envelope);
      adopt(dataKey, envelope);

      setPhrase(nextPhrase);
    } catch (error) {
      toast.error(authErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  });

  if (phrase) {
    return (
      <RecoveryPhrase
        phrase={phrase}
        onConfirmed={() => router.replace("/dashboard")}
      />
    );
  }

  return (
    <AuthShell
      title="Create your space"
      subtitle="Your entries are encrypted on your device before they leave it. Nobody else can read them — including us."
      footer={
        <>
          Already have an account?{" "}
          <Link
            href="/sign-in"
            className="font-bold text-deep-600 underline-offset-4 hover:underline dark:text-deep-300"
          >
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <Input
          label="What should we call you?"
          autoComplete="given-name"
          placeholder="Frede"
          error={errors.displayName?.message}
          {...register("displayName")}
        />
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register("email")}
        />
        <Input
          label="Password"
          type="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          hint="This also unlocks your entries, so pick something you will remember."
          error={errors.password?.message}
          {...register("password")}
        />
        <Input
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          placeholder="Type it once more"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />
        <Button type="submit" size="lg" fullWidth loading={submitting}>
          Create account
        </Button>

        <p className="text-center text-[11px] leading-relaxed text-ink-subtle">
          By creating an account you agree to the{" "}
          <Link href="/terms" className="font-semibold underline underline-offset-2">
            terms
          </Link>{" "}
          and the{" "}
          <Link href="/privacy" className="font-semibold underline underline-offset-2">
            privacy policy
          </Link>
          .
        </p>
      </form>
    </AuthShell>
  );
}
