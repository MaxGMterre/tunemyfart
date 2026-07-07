import type { Variants } from "framer-motion";

export const cartoonVariants = {
  bounce: {
    initial: { scale: 0, opacity: 0 },
    animate: { scale: 1, opacity: 1, transition: { type: "spring", stiffness: 400, damping: 15 } },
    exit: { scale: 0, opacity: 0 }
  } as Variants,
  wobble: {
    animate: { rotate: [0, -3, 3, -2, 2, 0], transition: { duration: 0.5 } }
  } as Variants,
  shake: {
    animate: { x: [0, -4, 4, -4, 4, 0], transition: { duration: 0.4 } }
  } as Variants,
  scaleUp: {
    initial: { scale: 0.9, opacity: 0.8 },
    animate: { scale: 1, opacity: 1, transition: { type: "spring", stiffness: 300 } }
  } as Variants,
  slideUp: {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1, transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] } },
    exit: { y: -20, opacity: 0 }
  } as Variants,
};

export function useCartoonAnimation() {
  return { variants: cartoonVariants };
}
