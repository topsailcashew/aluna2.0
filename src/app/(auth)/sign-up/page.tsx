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
import { signUpSchema, type SignUpValues } from "@/lib/schemas";

export default function SignUpPage() {
  const { signUp, configured } = useAuth();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

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
      await signUp(values.displayName, values.email, values.password);
      toast.success("Welcome to Aluna");
      router.replace("/dashboard");
    } catch (error) {
      toast.error(authErrorMessage(error));
      setSubmitting(false);
    }
  });

  return (
    <AuthShell
      title="Create your space"
      subtitle="Everything you log stays private to your account — this is a notebook, not a feed."
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
      </form>
    </AuthShell>
  );
}
