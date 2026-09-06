"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  CircleCheckBig,
  House,
  LifeBuoy,
  MessagesSquare,
  User,
} from "lucide-react";

import { cn } from "@/lib/utils";

const TABS = [
  { href: "/dashboard", label: "Home", Icon: House },
  { href: "/check-in", label: "Check-in", Icon: CircleCheckBig },
  { href: "/tools", label: "Tools", Icon: LifeBuoy },
  { href: "/community", label: "Community", Icon: MessagesSquare },
  { href: "/profile", label: "Profile", Icon: User },
] as const;

/** Everything the Tools hub gathers — the Tools tab stays lit across them. */
const TOOLS_ROUTES = ["/tools", "/breathe", "/ramble", "/journey", "/journal"];

/** Shared spring, so the chip, its width and the label all move as one piece. */
const SPRING = { type: "spring" as const, stiffness: 380, damping: 32 };

/**
 * Floating dark pill, per the reference. Sits off the bottom edge, the active
 * one lifted into a light chip. The pill is near-black in light and a raised
 * surface in dark — a consistent dark bar either way, which is what makes it
 * read as "chrome" against the warm mood aura behind it.
 *
 * Only the active tab carries a written label. Icons alone left Tools and
 * Community guessable at best, but labelling all five grows the pill into the
 * full-width bar this design moved away from — so the name appears on the one
 * tab you just tapped, which is where you are looking anyway.
 */
export function BottomNav() {
  const pathname = usePathname();

  // Focused, multi-step flows carry their own back control and fixed action
  // bar — the tab bar only competes with them, so it steps aside.
  if (pathname.startsWith("/check-in") || pathname.startsWith("/journey")) {
    return null;
  }

  return (
    <nav
      aria-label="Primary"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center pb-[calc(env(safe-area-inset-bottom)+0.6rem)]"
    >
      <ul className="pointer-events-auto flex max-w-[calc(100vw-1rem)] items-center gap-1 rounded-full border border-white/10 bg-[#12262c] px-2 py-2 shadow-lift dark:bg-[#1a2c33]">
        {TABS.map(({ href, label, Icon }) => {
          const active =
            href === "/tools"
              ? TOOLS_ROUTES.some(
                  (r) => pathname === r || pathname.startsWith(`${r}/`),
                )
              : pathname === href || pathname.startsWith(`${href}/`);
          return (
            <motion.li key={href} layout transition={SPRING}>
              <Link
                href={href}
                aria-label={label}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex h-12 items-center justify-center gap-1.5 rounded-full transition-colors",
                  active
                    ? "min-w-0 px-3 text-white max-[359px]:w-12 max-[359px]:px-0"
                    : "w-12 shrink-0 text-white/45 hover:text-white/80",
                )}
              >
                {active && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 -z-10 rounded-full bg-white/15 ring-1 ring-white/15"
                    transition={SPRING}
                  />
                )}
                <Icon
                  className="size-5 shrink-0"
                  strokeWidth={active ? 2.6 : 2}
                  aria-hidden
                />
                {active && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    transition={SPRING}
                    // Below 360px the five icons already fill the pill; a label
                    // there would push Home and Profile out of it entirely.
                    className="hidden min-w-0 overflow-hidden whitespace-nowrap text-xs font-bold min-[360px]:block"
                  >
                    {label}
                  </motion.span>
                )}
              </Link>
            </motion.li>
          );
        })}
      </ul>
    </nav>
  );
}
