"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { animate, stagger } from "framer-motion";

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

  useEffect(() => {
    let lateBindTimer: number | null = null;
    let startTimer: number | null = null;
    const revealedElements = new WeakSet<HTMLElement>();
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let observer: IntersectionObserver | null = null;

    const revealElements = (elements: HTMLElement[]) => {
      if (elements.length === 0) return;

      animate(
        elements,
        {
          opacity: [0, 1],
          y: [22, 0],
          filter: ["blur(6px)", "blur(0px)"],
        },
        {
          duration: 0.6,
          ease: [0.22, 1, 0.36, 1],
          delay: stagger(0.07),
        }
      );

      elements.forEach((element) => {
        revealedElements.add(element);
        element.style.transform = "none";
        element.style.filter = "none";
        element.style.willChange = "auto";
        observer?.unobserve(element);
      });
    };

    const bindTargets = (elements: HTMLElement[]) => {
      if (prefersReducedMotion) {
        elements.forEach((element) => {
          element.style.opacity = "1";
          element.style.transform = "none";
          element.style.filter = "none";
        });
        return;
      }

      elements.forEach((element) => {
        if (revealedElements.has(element)) return;

        const rect = element.getBoundingClientRect();
        const alreadyVisible =
          rect.top < window.innerHeight * 0.92 && rect.bottom > window.innerHeight * 0.05;

        element.style.opacity = "0";
        element.style.transform = "translate3d(0, 22px, 0)";
        element.style.filter = "blur(6px)";
        element.style.willChange = "opacity, transform, filter";

        if (alreadyVisible) {
          revealElements([element]);
          return;
        }

        observer?.observe(element);
      });
    };

    if (!prefersReducedMotion) {
      observer = new IntersectionObserver(
        (entries) => {
          const visibleTargets: HTMLElement[] = [];

          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;

            const element = entry.target as HTMLElement;
            if (revealedElements.has(element)) return;
            visibleTargets.push(element);
          });

          revealElements(visibleTargets);
        },
        {
          threshold: 0.16,
          rootMargin: "0px 0px -10% 0px",
        }
      );
    }

    startTimer = window.setTimeout(() => {
      const targets = collectTargets();
      bindTargets(targets);

      lateBindTimer = window.setTimeout(() => {
        const lateTargets = collectTargets().filter((element) => !revealedElements.has(element));
        bindTargets(lateTargets);
      }, 320);
    }, 0);

    return () => {
      if (startTimer) {
        window.clearTimeout(startTimer);
      }
      if (lateBindTimer) {
        window.clearTimeout(lateBindTimer);
      }
      observer?.disconnect();
    };
  }, [pathname]);

  return null;
}
