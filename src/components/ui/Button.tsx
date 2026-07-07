import type { ReactNode } from "react";
import { motion } from "framer-motion";
import type { HTMLMotionProps } from "framer-motion";

type ButtonVariant = "primary" | "secondary" | "tertiary" | "danger" | "success" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "ref"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
  fullWidth?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  children,
  fullWidth = false,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  return (
    <motion.button
      className={`btn btn--${variant} btn--${size}${fullWidth ? " btn--full" : ""} ${className}`}
      whileHover={disabled ? undefined : { y: -3, x: -3, boxShadow: "8px 8px 0px 0px #1D1D1F" }}
      whileTap={disabled ? undefined : { y: 5, x: 5, boxShadow: "0px 0px 0px 0px #1D1D1F" }}
      transition={{ type: "spring", stiffness: 500, damping: 25 }}
      disabled={disabled}
      {...props}
    >
      {children}
    </motion.button>
  );
}
