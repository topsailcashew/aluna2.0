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

/**
 * Floating dark pill, per the reference. Sits off the bottom edge, icons only,
 * the active one lifted into a light chip. The pill is near-black in light and
 * a raised surface in dark — a consistent dark bar either way, which is what
 * makes it read as "chrome" against the warm mood aura behind it.
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
      <ul className="pointer-events-auto flex items-center gap-1 rounded-full border border-white/10 bg-[#12262c] px-2 py-2 shadow-lift dark:bg-[#1a2c33]">
        {TABS.map(({ href, label, Icon }) => {
          const active =
            href === "/tools"
              ? TOOLS_ROUTES.some(
                  (r) => pathname === r || pathname.startsWith(`${r}/`),
                )
              : pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-label={label}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative grid size-12 place-items-center rounded-full transition-colors",
                  active ? "text-white" : "text-white/45 hover:text-white/80",
                )}
              >
                {active && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 -z-10 rounded-full bg-white/15 ring-1 ring-white/15"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                <Icon
                  className="size-5"
                  strokeWidth={active ? 2.6 : 2}
                  aria-hidden
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
