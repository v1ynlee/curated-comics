"use client";

// ============================================================
// Breadcrumb — cinematic page location indicator
//
// Usage:
//   <Breadcrumb items={[
//     { label: 'Home', href: '/' },
//     { label: 'Library' },          // last item = current, no href
//   ]} />
//
// Design Updates:
//   - Added responsive top-margin to clear fixed mobile headers.
//   - Scaled down typography and gaps specifically for mobile devices.
//   - Retains the minimalist, background-free cinematic aesthetic.
// ============================================================

import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      // Added relative z-10 and responsive top margin to prevent mobile header overlap
      className={cn(
        "relative z-10 flex justify-center w-full mt-6 md:mt-2",
        className,
      )}
    >
      <motion.ol
        // Adjusted gaps to be tighter on mobile, wider on desktop
        className="flex items-center gap-2.5 sm:gap-4 flex-wrap justify-center px-4"
        role="list"
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          const isFirst = i === 0;

          return (
            <motion.li
              key={`${item.label}-${i}`}
              className="flex items-center gap-2.5 sm:gap-4"
              initial={{ opacity: 0, filter: "blur(4px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              transition={{
                duration: 0.5,
                ease: "easeOut",
                delay: i * 0.15, // Staggered reveal
              }}
            >
              {/* Separator — refined editorial slash */}
              {!isFirst && (
                <span
                  className="text-text-primary/20 font-light text-[10px] sm:text-xs select-none"
                  aria-hidden="true"
                >
                  /
                </span>
              )}

              {isLast ? (
                /* Active (current) page — bold text, subtle text-glow, no link */
                <span
                  // Mobile: 8px | Desktop: 10px
                  className="font-heading text-[8px] sm:text-[10px] font-bold tracking-[0.25em] sm:tracking-[0.3em] uppercase leading-none text-text-primary"
                  aria-current="page"
                  style={{
                    textShadow:
                      "0 0 16px color-mix(in srgb, var(--color-text-primary) 30%, transparent)",
                  }}
                >
                  {item.label}
                </span>
              ) : item.href ? (
                /* Parent item — muted, soft hover transition */
                <Link
                  href={item.href}
                  className={cn(
                    "font-heading text-[8px] sm:text-[10px] font-medium tracking-[0.25em] sm:tracking-[0.3em] uppercase leading-none",
                    "text-text-tertiary hover:text-text-primary",
                    "transition-colors duration-300",
                    "focus-visible:outline-none focus-visible:text-accent-primary",
                  )}
                >
                  {item.label}
                </Link>
              ) : (
                /* Parent item — no href, non-interactive */
                <span className="font-heading text-[8px] sm:text-[10px] font-medium tracking-[0.25em] sm:tracking-[0.3em] uppercase leading-none text-text-tertiary">
                  {item.label}
                </span>
              )}
            </motion.li>
          );
        })}
      </motion.ol>
    </nav>
  );
}
