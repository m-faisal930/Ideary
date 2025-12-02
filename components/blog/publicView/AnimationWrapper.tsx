"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface AnimationWrapperProps {
  children: ReactNode;
}

export function AnimationWrapper({ children }: AnimationWrapperProps) {
  return (
    <motion.div 
      whileHover={{ scale: 1.03 }} 
      className="transition-all"
    >
      {children}
    </motion.div>
  );
}