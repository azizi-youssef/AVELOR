"use client";

import React from "react";
import { motion, AnimatePresence, HTMLMotionProps, Variants } from "framer-motion";

/**
 * Courbe d'accélération de luxe (Cubic Bézier soyeux et progressif)
 */
export const LUXURY_EASE = [0.16, 1, 0.3, 1] as const;

/**
 * 1. LuxuryFadeIn : apparition fluide et subtile au scroll ou au montage
 */
interface LuxuryFadeInProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  distance?: number;
  viewportOnce?: boolean;
}

export function LuxuryFadeIn({
  children,
  delay = 0,
  duration = 0.8,
  direction = "up",
  distance = 24,
  viewportOnce = true,
  className = "",
  ...props
}: LuxuryFadeInProps) {
  const getInitialPosition = () => {
    switch (direction) {
      case "up":
        return { opacity: 0, y: distance };
      case "down":
        return { opacity: 0, y: -distance };
      case "left":
        return { opacity: 0, x: distance };
      case "right":
        return { opacity: 0, x: -distance };
      default:
        return { opacity: 0 };
    }
  };

  return (
    <motion.div
      initial={getInitialPosition()}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: viewportOnce, margin: "-40px" }}
      transition={{
        duration,
        delay,
        ease: LUXURY_EASE,
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/**
 * 2. LuxuryStagger : conteneur de groupe pour révéler les enfants les uns après les autres
 */
interface LuxuryStaggerProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  staggerDelay?: number;
  delayChildren?: number;
}

const staggerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: (custom = {}) => ({
    opacity: 1,
    transition: {
      staggerChildren: custom.staggerDelay || 0.12,
      delayChildren: custom.delayChildren || 0.05,
    },
  }),
};

export function LuxuryStagger({
  children,
  staggerDelay = 0.1,
  delayChildren = 0.05,
  className = "",
  ...props
}: LuxuryStaggerProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      variants={staggerVariants}
      custom={{ staggerDelay, delayChildren }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/**
 * 3. LuxuryStaggerItem : élément enfant du conteneur LuxuryStagger
 */
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: LUXURY_EASE,
    },
  },
};

export function LuxuryStaggerItem({
  children,
  className = "",
  ...props
}: HTMLMotionProps<"div">) {
  return (
    <motion.div variants={itemVariants} className={className} {...props}>
      {children}
    </motion.div>
  );
}

/**
 * 4. LuxuryScaleHover : micro-animation pour cartes, boutons et icônes
 */
interface LuxuryScaleHoverProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  scale?: number;
  lift?: number;
}

export function LuxuryScaleHover({
  children,
  scale = 1.015,
  lift = -3,
  className = "",
  ...props
}: LuxuryScaleHoverProps) {
  return (
    <motion.div
      whileHover={{ scale, y: lift }}
      whileTap={{ scale: 0.98, y: 0 }}
      transition={{ duration: 0.35, ease: LUXURY_EASE }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export { motion, AnimatePresence };
