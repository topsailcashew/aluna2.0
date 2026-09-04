/**
 * The 29 locations offered in step 1 of the check-in.
 *
 * `region` groups them for the picker's column layout, and `point` positions
 * the marker on the body silhouette (percentages of the SVG viewBox, so the
 * diagram scales freely).
 */

export type BodyRegion = "head" | "torso" | "arms" | "legs" | "whole";

export interface BodyPart {
  id: string;
  label: string;
  region: BodyRegion;
  /** [x, y] as a percentage of the silhouette box. `null` = no marker. */
  point: [number, number] | null;
}

export const BODY_PARTS: BodyPart[] = [
  { id: "head", label: "Head", region: "head", point: [50, 5] },
  { id: "face", label: "Face", region: "head", point: [50, 8.5] },
  { id: "eyes", label: "Eyes", region: "head", point: [44, 7.5] },
  { id: "ears", label: "Ears", region: "head", point: [57.5, 7.5] },
  { id: "nose", label: "Nose", region: "head", point: [50, 9.5] },
  { id: "mouth", label: "Mouth", region: "head", point: [50, 11] },
  { id: "jaw", label: "Jaw", region: "head", point: [44, 11.5] },
  { id: "neck", label: "Neck", region: "head", point: [50, 14.5] },
  { id: "throat", label: "Throat", region: "head", point: [53.5, 15.5] },

  { id: "shoulders", label: "Shoulders", region: "torso", point: [37, 19] },
  { id: "chest", label: "Chest", region: "torso", point: [50, 24] },
  { id: "upper-back", label: "Upper Back", region: "torso", point: [63, 23] },
  { id: "lower-back", label: "Lower Back", region: "torso", point: [63, 34] },
  { id: "stomach", label: "Stomach", region: "torso", point: [50, 32] },
  { id: "abdomen", label: "Abdomen", region: "torso", point: [50, 38] },
  { id: "hips", label: "Hips", region: "torso", point: [41, 43] },

  { id: "arms", label: "Arms", region: "arms", point: [29, 30] },
  { id: "elbows", label: "Elbows", region: "arms", point: [26, 36] },
  { id: "wrists", label: "Wrists", region: "arms", point: [22, 45] },
  { id: "hands", label: "Hands", region: "arms", point: [20, 50] },
  { id: "fingers", label: "Fingers", region: "arms", point: [18.5, 54] },

  { id: "legs", label: "Legs", region: "legs", point: [42, 58] },
  { id: "thighs", label: "Thighs", region: "legs", point: [42, 53] },
  { id: "knees", label: "Knees", region: "legs", point: [43, 66] },
  { id: "ankles", label: "Ankles", region: "legs", point: [44, 87] },
  { id: "feet", label: "Feet", region: "legs", point: [44, 93] },
  { id: "toes", label: "Toes", region: "legs", point: [44, 97] },

  { id: "whole-body", label: "Whole Body", region: "whole", point: null },
  { id: "other", label: "Other", region: "whole", point: null },
];

export const BODY_PART_BY_ID = new Map(BODY_PARTS.map((p) => [p.id, p]));

export function bodyPartLabel(id: string): string {
  return BODY_PART_BY_ID.get(id)?.label ?? id;
}

export const BODY_REGION_LABELS: Record<BodyRegion, string> = {
  head: "Head & neck",
  torso: "Torso",
  arms: "Arms & hands",
  legs: "Legs & feet",
  whole: "General",
};
