"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { AuthShell } from "@/components/layout/auth-shell";
import { SetupNotice } from "@/components/layout/setup-notice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authErrorMessage, useAuth } from "@/lib/firebase/auth-context";
import { signInSchema, type SignInValues } from "@/lib/schemas";

export default function SignInPage() {
  const { signIn, configured } = useAuth();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  if (!configured) return <SetupNotice />;

  const onSubmit = handleSubmit(async (values) => {
    setSubmitting(true);
    try {
      await signIn(values.email, values.password);
      router.replace("/dashboard");
    } catch (error) {
      toast.error(authErrorMessage(error));
      setSubmitting(false);
    }
  });

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Pick up where you left off. Your check-ins are waiting, exactly as you left them."
      footer={
        <>
          New to Aluna?{" "}
          <Link
            href="/sign-up"
            className="font-bold text-deep-600 underline-offset-4 hover:underline dark:text-deep-300"
          >
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
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
          autoComplete="current-password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register("password")}
        />
        <Button type="submit" size="lg" fullWidth loading={submitting}>
          Sign in
        </Button>
      </form>
    </AuthShell>
  );
}
