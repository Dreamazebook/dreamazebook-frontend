import { motion, useInView } from "framer-motion";
import { useRef } from "react";
// Add a reusable animated section component
export const AnimatedSection = ({ children, style, className = "" }: { children: React.ReactNode, style?: React.CSSProperties, className?: string }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.5 }}
      style={style as any} // Type assertion to fix type error
      className={className}
    >
      {children}
    </motion.div>
  );
};