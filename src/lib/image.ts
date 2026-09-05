/**
 * Client-side avatar preparation.
 *
 * The resized image is stored as a data URL on the user's own Firestore
 * document rather than in Cloud Storage. An avatar is only ever shown to the
 * person it belongs to, so a CDN buys nothing, and this removes a whole
 * bucket's worth of setup and a second set of security rules. A 192px JPEG
 * lands around 15 KB — comfortably inside Firestore's 1 MiB document ceiling.
 */

export const AVATAR_SIZE = 192;
export const MAX_AVATAR_BYTES = 80_000;

export class ImageTooLargeError extends Error {
  constructor() {
    super("That image is too large to store. Try a smaller crop.");
    this.name = "ImageTooLargeError";
  }
}

/** Rough byte count of a data URL's payload. */
function dataUrlBytes(dataUrl: string): number {
  const comma = dataUrl.indexOf(",");
  return Math.ceil(((dataUrl.length - comma - 1) * 3) / 4);
}

/**
 * Centre-crops to a square, scales to AVATAR_SIZE, and encodes as JPEG,
 * stepping quality down until it fits the budget.
 */
export async function prepareAvatar(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);

  try {
    const side = Math.min(bitmap.width, bitmap.height);
    const sx = (bitmap.width - side) / 2;
    const sy = (bitmap.height - side) / 2;

    const canvas = document.createElement("canvas");
    canvas.width = AVATAR_SIZE;
    canvas.height = AVATAR_SIZE;

    const context = canvas.getContext("2d");
    if (!context) throw new Error("Could not read that image.");

    context.imageSmoothingQuality = "high";
    context.drawImage(
      bitmap,
      sx,
      sy,
      side,
      side,
      0,
      0,
      AVATAR_SIZE,
      AVATAR_SIZE,
    );

    for (const quality of [0.82, 0.7, 0.6, 0.5, 0.4]) {
      const dataUrl = canvas.toDataURL("image/jpeg", quality);
      if (dataUrlBytes(dataUrl) <= MAX_AVATAR_BYTES) return dataUrl;
    }
    throw new ImageTooLargeError();
  } finally {
    bitmap.close();
  }
}

