import React, { useEffect, useRef } from "react";

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const hasCoarsePointer = () =>
  typeof window !== "undefined" &&
  window.matchMedia &&
  window.matchMedia("(pointer: coarse)").matches;

const MouseEffects = () => {
  const largeGlowRef = useRef(null);
  const smallGlowRef = useRef(null);
  const rafRef = useRef(0);
  const targetRef = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0 });
  const activeElementRef = useRef(null);

  useEffect(() => {
    if (prefersReducedMotion() || hasCoarsePointer()) {
      return undefined;
    }

    const root = document.documentElement;
    const reactiveSelector = ".pb-tilt-card, .pb-reactive";

    const resetLocalReactivity = (element) => {
      if (!element) {
        return;
      }

      element.style.removeProperty("--pb-local-tx");
      element.style.removeProperty("--pb-local-ty");
      element.style.removeProperty("--pb-local-rx");
      element.style.removeProperty("--pb-local-ry");
      element.style.removeProperty("--pb-local-glow");
      element.style.removeProperty("--pb-local-glow-x");
      element.style.removeProperty("--pb-local-glow-y");
    };

    const applyLocalReactivity = (element, clientX, clientY) => {
      const rect = element.getBoundingClientRect();
      if (!rect.width || !rect.height) {
        return;
      }

      const depth = Number.parseFloat(element.dataset.reactiveDepth || "1");
      const localX = Math.min(Math.max(clientX - rect.left, 0), rect.width);
      const localY = Math.min(Math.max(clientY - rect.top, 0), rect.height);
      const ratioX = localX / rect.width;
      const ratioY = localY / rect.height;
      const centeredX = ratioX - 0.5;
      const centeredY = ratioY - 0.5;

      element.style.setProperty("--pb-local-tx", `${(centeredX * 18 * depth).toFixed(2)}px`);
      element.style.setProperty("--pb-local-ty", `${(centeredY * 14 * depth).toFixed(2)}px`);
      element.style.setProperty("--pb-local-rx", `${(-centeredY * 11 * depth).toFixed(2)}deg`);
      element.style.setProperty("--pb-local-ry", `${(centeredX * 13 * depth).toFixed(2)}deg`);
      element.style.setProperty("--pb-local-glow", "1");
      element.style.setProperty("--pb-local-glow-x", `${(ratioX * 100).toFixed(2)}%`);
      element.style.setProperty("--pb-local-glow-y", `${(ratioY * 100).toFixed(2)}%`);
    };

    const updateRatios = (x, y) => {
      const width = window.innerWidth || 1;
      const height = window.innerHeight || 1;
      const ratioX = Math.min(Math.max(x / width, 0), 1);
      const ratioY = Math.min(Math.max(y / height, 0), 1);
      root.style.setProperty("--pb-mouse-x", ratioX.toFixed(4));
      root.style.setProperty("--pb-mouse-y", ratioY.toFixed(4));
    };

    const centerX = window.innerWidth * 0.5;
    const centerY = window.innerHeight * 0.5;
    targetRef.current = { x: centerX, y: centerY };
    currentRef.current = { x: centerX, y: centerY };
    updateRatios(centerX, centerY);

    const onPointerMove = (event) => {
      targetRef.current = { x: event.clientX, y: event.clientY };
      updateRatios(event.clientX, event.clientY);

      const nextActive =
        event.target instanceof Element
          ? event.target.closest(reactiveSelector)
          : null;

      if (activeElementRef.current && activeElementRef.current !== nextActive) {
        resetLocalReactivity(activeElementRef.current);
      }

      activeElementRef.current = nextActive;

      if (activeElementRef.current instanceof HTMLElement) {
        applyLocalReactivity(activeElementRef.current, event.clientX, event.clientY);
      }
    };

    const onPointerLeave = () => {
      targetRef.current = { x: window.innerWidth * 0.5, y: window.innerHeight * 0.5 };
      resetLocalReactivity(activeElementRef.current);
      activeElementRef.current = null;
    };

    const animate = () => {
      const current = currentRef.current;
      const target = targetRef.current;

      current.x += (target.x - current.x) * 0.15;
      current.y += (target.y - current.y) * 0.15;

      const largeX = current.x - 170;
      const largeY = current.y - 170;
      const smallX = current.x - 70;
      const smallY = current.y - 70;

      if (largeGlowRef.current) {
        largeGlowRef.current.style.transform = `translate3d(${largeX}px, ${largeY}px, 0)`;
      }

      if (smallGlowRef.current) {
        smallGlowRef.current.style.transform = `translate3d(${smallX}px, ${smallY}px, 0)`;
      }

      rafRef.current = window.requestAnimationFrame(animate);
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerleave", onPointerLeave);
    rafRef.current = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(rafRef.current);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerleave", onPointerLeave);
      resetLocalReactivity(activeElementRef.current);
      activeElementRef.current = null;
      root.style.removeProperty("--pb-mouse-x");
      root.style.removeProperty("--pb-mouse-y");
    };
  }, []);

  if (prefersReducedMotion() || hasCoarsePointer()) {
    return null;
  }

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[60] overflow-hidden">
      <div
        ref={largeGlowRef}
        className="absolute h-[340px] w-[340px] rounded-full bg-emerald-300/14 blur-3xl"
      />
      <div
        ref={smallGlowRef}
        className="absolute h-[140px] w-[140px] rounded-full bg-teal-300/18 blur-2xl"
      />
    </div>
  );
};

export default MouseEffects;
