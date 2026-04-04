"use client";

import { useMemo } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const LOADER_TEXT = "DIETARA";
const LOADER_TAGLINE = "Fueling Your Next Step";

export default function NavigationLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const routeKey = useMemo(
    () => `${pathname}?${searchParams.toString()}`,
    [pathname, searchParams]
  );

  return (
    <div
      key={routeKey}
      className="pointer-events-none fixed inset-0 z-[2200] flex items-center justify-center px-6 opacity-0 animate-[dietaraRouteLoader_650ms_ease-out_forwards]"
      aria-hidden="true"
    >
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#12020ad6_0%,#19040fd9_40%,#0e0207de_100%)] backdrop-blur-[3px]" />

      <section className="relative text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#ffc8d8]">
          {LOADER_TAGLINE}
        </p>

        <div className="mt-5 flex items-center justify-center gap-1.5 sm:gap-2">
          {LOADER_TEXT.split("").map((letter, index) => (
            <span
              key={`${letter}-${index}`}
              className="dietara-loader-letter text-4xl font-extrabold tracking-[0.12em] text-[#ffe3eb] sm:text-5xl"
              style={{ animationDelay: `${index * 120}ms` }}
            >
              {letter}
            </span>
          ))}
        </div>

        <div className="mx-auto mt-6 h-1.5 w-52 overflow-hidden rounded-full bg-[#ff9fba]/20">
          <div className="h-full w-1/2 animate-[pulse_1s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-[#ff88aa] via-[#ffd4df] to-[#ff6e98]" />
        </div>
      </section>
    </div>
  );
}
