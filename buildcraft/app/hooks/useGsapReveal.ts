"use client";

import { RefObject, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// SSR check: only register ScrollTrigger on client side
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

type RevealOptions = {
  selector?: string;
  stagger?: number;
  from?: gsap.TweenVars;
  to?: gsap.TweenVars;
  scrollTrigger?: boolean | object;
};

export function useGsapReveal(ref: RefObject<HTMLElement | null>, options: RevealOptions = {}) {
  useEffect(() => {
    const element = ref.current;

    if (!element) {
      return;
    }

    const targets = options.selector ? element.querySelectorAll(options.selector) : element;

    const context = gsap.context(() => {
      let scrollTriggerConfig: any = undefined;

      if (options.scrollTrigger) {
        if (typeof options.scrollTrigger === "boolean") {
          scrollTriggerConfig = {
            trigger: element,
            start: "top 85%",
            toggleActions: "play none none none",
          };
        } else {
          scrollTriggerConfig = {
            trigger: element,
            start: "top 85%",
            toggleActions: "play none none none",
            ...options.scrollTrigger,
          };
        }
      }

      gsap.fromTo(
        targets,
        {
          opacity: 0,
          y: 28,
          ...options.from,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: "power3.out",
          stagger: options.stagger ?? 0,
          scrollTrigger: scrollTriggerConfig,
          ...options.to,
        },
      );
    }, element);

    return () => context.revert();
  }, [options.from, options.selector, options.stagger, options.to, options.scrollTrigger, ref]);
}