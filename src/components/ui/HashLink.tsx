"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import type { ComponentProps } from "react";

type HashLinkProps = ComponentProps<typeof Link>;

/**
 * Extract the hash from an href string, returning the bare hash name
 * (without the leading "#") if the href points to a hash on the current
 * page, or `null` if no hash or a different page is targeted.
 */
function resolveSamePageHash(
  href: unknown,
  currentPathname: string
): string | null {
  if (typeof href !== "string") return null;
  const hashIdx = href.indexOf("#");
  if (hashIdx < 0) return null;
  const targetPath = href.slice(0, hashIdx) || currentPathname;
  const targetHash = href.slice(hashIdx + 1);
  if (targetPath === currentPathname && targetHash) return targetHash;
  return null;
}

/**
 * A drop-in replacement for `next/link` that fixes a bug where clicking
 * a link on the same page with a different hash results in hash
 * concatenation (e.g. `/about#core-value#trust-line`) instead of
 * replacement (`/about#trust-line`).
 *
 * For same-page hash links, it bypasses Next.js's client-side navigation
 * and uses the browser's native `location.hash` setter instead. For all
 * other links it behaves identically to `next/link`.
 */
export const HashLink = React.forwardRef<HTMLAnchorElement, HashLinkProps>(
  function HashLink({ href, onClick, ...props }, ref) {
    const pathname = usePathname();
    const samePageHash = resolveSamePageHash(href, pathname);

    const handleClick = samePageHash
      ? (e: React.MouseEvent<HTMLAnchorElement>) => {
          // preventDefault() signals to Next.js Link's internal handler
          // that it should skip the programmatic navigation dispatch
          // (see next/dist/client/app-dir/link.js line 319)
          e.preventDefault();
          window.location.hash = samePageHash;
          onClick?.(e);
        }
      : onClick;

    return <Link ref={ref} href={href} onClick={handleClick} {...props} />;
  }
);
