"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { CircleCheckBig, House, User, Users, Wind } from "lucide-react";

import { cn } from "@/lib/utils";

const TABS = [
  { href: "/dashboard", label: "Home", Icon: House },
  { href: "/check-in", label: "Check-in", Icon: CircleCheckBig },
  { href: "/breathe", label: "Breathe", Icon: Wind },
  { href: "/community", label: "Community", Icon: Users },
  { href: "/profile", label: "Profile", Icon: User },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/85 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl"
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-around px-2">
        {TABS.map(({ href, label, Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex flex-col items-center gap-1 py-2.5 text-[10px] font-bold transition-colors",
                  active ? "text-deep-600 dark:text-deep-200" : "text-ink-subtle",
                )}
              >
                {active && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-x-1.5 top-1 bottom-1 -z-10 rounded-2xl bg-deep-50 dark:bg-deep-900"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                <Icon
                  className="size-5"
                  strokeWidth={active ? 2.5 : 2}
                  aria-hidden
                />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
