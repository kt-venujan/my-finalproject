"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

const hiddenClasses = [
  "opacity-0",
  "translate-y-6",
  "transition-all",
  "duration-700",
  "ease-out",
  "will-change-transform",
  "motion-reduce:opacity-100",
  "motion-reduce:translate-y-0",
  "motion-reduce:transition-none",
];

const visibleClasses = ["opacity-100", "translate-y-0"];

const revealSelectors = ["main > *", "main section", "main article", "[data-scroll-reveal]"];

const collectTargets = () => {
  const targetSet = new Set<HTMLElement>();

  revealSelectors.forEach((selector) => {
    document.querySelectorAll<HTMLElement>(selector).forEach((node) => {
      if (node.dataset.scrollRevealIgnore === "true") return;
      if (node.offsetHeight < 44) return;
      targetSet.add(node);
    });
  });

  return Array.from(targetSet);
};

export default function ScrollReveal() {
  const pathname = usePathname();
  const skippedInitialHydrationRef = useRef(false);

  const setupReveal = () => {
    const targets = collectTargets();
    if (targets.length === 0) return () => {};

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      targets.forEach((element) => {
        element.classList.add(...visibleClasses);
      });
      return () => {};
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const element = entry.target as HTMLElement;
          element.classList.remove("opacity-0", "translate-y-6");
          element.classList.add(...visibleClasses);
          observer.unobserve(element);
        });
      },
      {
        threshold: 0.16,
        rootMargin: "0px 0px -10% 0px",
      }
    );

    const bindTargets = (elements: HTMLElement[], offsetIndex = 0) => {
      elements.forEach((element, index) => {
        if (element.dataset.scrollRevealBound === "true") return;

        element.dataset.scrollRevealBound = "true";

        const rect = element.getBoundingClientRect();
        const alreadyVisible =
          rect.top < window.innerHeight * 0.92 && rect.bottom > window.innerHeight * 0.05;

        if (alreadyVisible) {
          element.classList.add(...visibleClasses);
          return;
        }

        element.classList.add(...hiddenClasses);
        element.classList.remove(...visibleClasses);
        element.style.transitionDelay = `${Math.min((offsetIndex + index) % 6, 5) * 80}ms`;
        observer.observe(element);
      });
    };

    bindTargets(targets);

    const lateBindTimer = window.setTimeout(() => {
      const lateTargets = collectTargets().filter(
        (element) => element.dataset.scrollRevealBound !== "true"
      );
      bindTargets(lateTargets, targets.length);
    }, 350);

    return () => {
      window.clearTimeout(lateBindTimer);
      observer.disconnect();
    };
  };

  useEffect(() => {
    if (!skippedInitialHydrationRef.current) {
      skippedInitialHydrationRef.current = true;
      return;
    }

    let cleanupReveal = () => {};
    let startTimer: number | null = null;

    startTimer = window.setTimeout(() => {
      cleanupReveal = setupReveal();
    }, 0);

    return () => {
      if (startTimer) {
        window.clearTimeout(startTimer);
      }
      cleanupReveal();
    };
  }, [pathname]);

  return null;
}
