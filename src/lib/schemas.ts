import { z } from "zod";

import { BODY_PART_BY_ID } from "@/lib/data/body-parts";
import { EMOTION_LABEL_BY_ID } from "@/lib/data/emotions";
import { THOUGHT_PATTERN_BY_ID } from "@/lib/data/thought-patterns";

export const MAX_NOTE_LENGTH = 200;

/**
 * Ceiling on sensations per check-in. Mirrored in firestore.rules — the two
 * must move together, or a save the UI permits gets rejected server-side.
 */
export const MAX_SENSATIONS = 60;

/* ------------------------------------------------------------------ */
/* Auth                                                                */
/* ------------------------------------------------------------------ */

const email = z.email("Enter a valid email address");

export const signInSchema = z.object({
  email,
  password: z.string().min(1, "Password is required"),
});

export const signUpSchema = z
  .object({
    displayName: z
      .string()
      .trim()
      .min(1, "Tell us what to call you")
      .max(60, "That name is a little long"),
    email,
    password: z
      .string()
      .min(8, "Use at least 8 characters")
      .max(128, "That password is too long"),
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export type SignInValues = z.infer<typeof signInSchema>;
export type SignUpValues = z.infer<typeof signUpSchema>;

/* ------------------------------------------------------------------ */
/* Check-in                                                            */
/* ------------------------------------------------------------------ */

export const sensationSchema = z.object({
  bodyPart: z
    .string()
    .refine((id) => BODY_PART_BY_ID.has(id), "Choose a body part"),
  intensity: z
    .number()
    .int()
    .min(0, "Intensity ranges from 0 to 10")
    .max(10, "Intensity ranges from 0 to 10"),
  note: z
    .string()
    .max(MAX_NOTE_LENGTH, `Keep notes under ${MAX_NOTE_LENGTH} characters`),
});

export type SensationValues = z.infer<typeof sensationSchema>;

/** A sensation once it is in the list — carries a client id for animations. */
export interface LoggedSensation extends SensationValues {
  id: string;
}

const tagScale = z.enum(["low", "mid", "high"]);

export const contextTagsSchema = z.object({
  sleep: tagScale.optional(),
  energy: tagScale.optional(),
  stress: tagScale.optional(),
  activities: z.array(z.string()).max(20),
});

export const journalSchema = z.record(
  z.string(),
  z.string().max(2000, "That is longer than a journal entry needs to be"),
);

export const checkInSchema = z.object({
  sensations: z
    .array(sensationSchema)
    .max(MAX_SENSATIONS, `Up to ${MAX_SENSATIONS} sensations per check-in`),
  emotions: z
    .array(z.string().refine((id) => EMOTION_LABEL_BY_ID.has(id)))
    .min(1, "Choose at least one emotion to complete your check-in"),
  thoughtPatterns: z
    .array(z.string().refine((id) => THOUGHT_PATTERN_BY_ID.has(id))),
  thoughtNote: z
    .string()
    .max(MAX_NOTE_LENGTH, `Keep notes under ${MAX_NOTE_LENGTH} characters`),
  tags: contextTagsSchema,
  journal: journalSchema,
});

export type CheckInValues = z.infer<typeof checkInSchema>;

/** First error message from a Zod parse, or null when the value is valid. */
export function firstIssue(result: z.ZodSafeParseResult<unknown>): string | null {
  return result.success ? null : (result.error.issues[0]?.message ?? "Invalid");
}
