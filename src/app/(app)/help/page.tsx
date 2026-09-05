"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, LifeBuoy, Mail, ScrollText, ShieldCheck } from "lucide-react";

import { BackHeader } from "@/components/layout/back-header";
import { Card, CardSubtitle, CardTitle } from "@/components/ui/card";
import { TOTAL_EMOTIONS } from "@/lib/data/emotions";
import { cn } from "@/lib/utils";

const HOW_TO = [
  {
    title: "Check in when you think of it",
    body: "The quick path is the emotion wheel and nothing else — most check-ins take under fifteen seconds. Add the body scan, context and a reflection when you have more to say.",
  },
  {
    title: "Name it as precisely as you can",
    body: `Start with a family, then narrow. There are ${TOTAL_EMOTIONS} words across three levels, and the precise one often lands differently from the obvious one. Pick as many as are true, including contradictory ones.`,
  },
  {
    title: "Missing days is fine",
    body: "There is no penalty and no broken streak to feel bad about. A record with gaps is still a record — and the gaps are shown honestly rather than smoothed over.",
  },
  {
    title: "Read patterns, not verdicts",
    body: "Insights waits until there are enough check-ins to say anything, then talks about tendencies. It will not tell you what to do, because it does not know.",
  },
];

const FAQ = [
  {
    q: "Is my data private?",
    a: "Yes, in the strongest sense available. Every entry is encrypted on your device before it is sent, with a key derived from your password that never leaves the browser. Nobody else can read your check-ins — not us, not anyone with access to the database.",
  },
  {
    q: "What happens if I forget my password?",
    a: "Your twelve-word recovery phrase unlocks your entries and lets you set a new password. If you lose the password and the phrase, your entries cannot be recovered by anyone, including us. That is the trade for real encryption, and there is no way around it.",
  },
  {
    q: "Why do I have to unlock after every reload?",
    a: "Because the key is only ever held in memory. Saving it to the device would spare you the step, but it would also leave the key somewhere it could be taken from.",
  },
  {
    q: "What if I miss days?",
    a: "Nothing happens. The calendar shows the gaps and the charts carry on. Aluna is a notebook, not a habit tracker with a guilt mechanic.",
  },
  {
    q: "Can anyone see what I write in Community?",
    a: "Only what you deliberately post there, and it carries no name or avatar. Your check-ins are never posted. The daily pulse counts one emotion family per person and nothing else, and only if you switch it on.",
  },
  {
    q: "Can I get my data out?",
    a: "Settings has an export that decrypts everything on your device and saves it as JSON. Delete removes every entry and the account itself, permanently.",
  },
];

export default function HelpPage() {
  return (
    <div className="space-y-5">
      <BackHeader eyebrow="Profile" title="Help & safety" />

      <section className="space-y-3">
        <h2 className="px-1 text-base font-extrabold tracking-tight text-ink">
          How to use Aluna
        </h2>
        {HOW_TO.map((item) => (
          <Card key={item.title} className="space-y-1">
            <CardTitle>{item.title}</CardTitle>
            <p className="text-xs leading-relaxed text-ink-muted">{item.body}</p>
          </Card>
        ))}
      </section>

      <section className="space-y-3">
        <h2 className="px-1 text-base font-extrabold tracking-tight text-ink">
          Questions
        </h2>
        <Card className="divide-y divide-line p-0">
          {FAQ.map((item) => (
            <FaqRow key={item.q} question={item.q} answer={item.a} />
          ))}
        </Card>
      </section>

      {/* The important part of this page. Deliberately not buried at the end
          of a scroll behind decorative content. */}
      <section className="space-y-3">
        <h2 className="px-1 text-base font-extrabold tracking-tight text-ink">
          If things are hard right now
        </h2>

        <Card className="space-y-3 border-[#eec39a] bg-[#fbeada] dark:border-[#6b452b] dark:bg-[#33231a]">
          <div className="flex items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-white/60 text-[#c9662a] dark:bg-black/20 dark:text-[#f0a468]">
              <LifeBuoy className="size-4.5" aria-hidden />
            </span>
            <CardTitle>Aluna is not therapy</CardTitle>
          </div>
          <p className="text-xs leading-relaxed text-[#7a4a22] dark:text-[#f0a468]">
            This is a notebook for noticing how you feel. It is not a medical
            device, it does not diagnose anything, and it is not a substitute
            for a doctor, a therapist or a crisis service. Nothing it shows you
            is clinical advice.
          </p>
          <p className="text-xs leading-relaxed font-semibold text-[#7a4a22] dark:text-[#f0a468]">
            If you are in immediate danger, contact your local emergency number
            now.
          </p>
        </Card>

        <Card className="space-y-3">
          <CardSubtitle>
            Free, confidential support — available around the clock
          </CardSubtitle>
          <ul className="space-y-2.5 text-sm">
            <li>
              <p className="font-bold text-ink">United Kingdom &amp; Ireland</p>
              <p className="text-xs text-ink-muted">
                Samaritans — call 116 123, or email jo@samaritans.org
              </p>
            </li>
            <li>
              <p className="font-bold text-ink">United States &amp; Canada</p>
              <p className="text-xs text-ink-muted">
                Suicide &amp; Crisis Lifeline — call or text 988
              </p>
            </li>
            <li>
              <p className="font-bold text-ink">Australia</p>
              <p className="text-xs text-ink-muted">Lifeline — call 13 11 14</p>
            </li>
            <li>
              <p className="font-bold text-ink">Anywhere else</p>
              <p className="text-xs text-ink-muted">
                findahelpline.com lists verified services by country.
              </p>
            </li>
          </ul>
          <p className="text-[11px] leading-relaxed text-ink-subtle">
            These numbers were correct when this page was written. Please check
            a current local source if something looks out of date.
          </p>
        </Card>
      </section>

      <Card className="p-0">
        <Link
          href="/privacy"
          className="flex items-center gap-3 border-b border-line p-4"
        >
          <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-surface-sunken text-ink-muted">
            <ShieldCheck className="size-4.5" aria-hidden />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-bold text-ink">Privacy</span>
            <span className="block text-xs text-ink-muted">
              What is stored, what cannot be read, how to remove it
            </span>
          </span>
        </Link>
        <Link href="/terms" className="flex items-center gap-3 p-4">
          <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-surface-sunken text-ink-muted">
            <ScrollText className="size-4.5" aria-hidden />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-bold text-ink">Terms</span>
            <span className="block text-xs text-ink-muted">
              What Aluna is, and what it is not
            </span>
          </span>
        </Link>
      </Card>

      <Card className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-surface-sunken text-ink-muted">
          <Mail className="size-4.5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1 space-y-1">
          <CardTitle>Something wrong?</CardTitle>
          <p className="text-xs leading-relaxed text-ink-muted">
            Aluna is a personal project rather than a company, so there is no
            support desk. Bugs and suggestions are best raised on the project&apos;s
            repository.
          </p>
        </div>
      </Card>
    </div>
  );
}

function FaqRow({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="p-4">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 text-left"
      >
        <span className="flex-1 text-sm font-bold text-ink">{question}</span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-ink-subtle transition-transform",
            open && "rotate-180",
          )}
          aria-hidden
        />
      </button>
      <div
        className={cn(
          "grid transition-[grid-template-rows,opacity] duration-300",
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="overflow-hidden">
          <p className="pt-2 text-xs leading-relaxed text-ink-muted">{answer}</p>
        </div>
      </div>
    </div>
  );
}
