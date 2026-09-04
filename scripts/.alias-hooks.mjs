// Resolves Next's "@/" alias and TypeScript's extensionless imports for the
// verification script, which runs the app's real modules under bare Node.
import { pathToFileURL, fileURLToPath } from "node:url";
import { dirname, resolve as joinPath } from "node:path";

const SRC = pathToFileURL(
  joinPath(dirname(fileURLToPath(import.meta.url)), "..", "src") + "/",
).href;

export async function resolve(specifier, context, next) {
  let target = specifier;
  if (target.startsWith("@/")) target = SRC + target.slice(2);
  if (target.startsWith("file:") && !/\.[cm]?[jt]sx?$/.test(target)) {
    try {
      return await next(target + ".ts", context);
    } catch {
      return next(target + ".tsx", context);
    }
  }
  return next(target, context);
}
