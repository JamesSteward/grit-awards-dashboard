import React from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useAnimation } from "framer-motion";
import { useState, useEffect } from "react";

// Safe Reveal component using react-intersection-observer with reduced motion support
const Reveal = ({ children, delay = 0, className = "" }) => {
  const controls = useAnimation();
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.2 });
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handleChange = (e) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    if (inView) controls.start("visible");
  }, [inView, controls]);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={{
        hidden: prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 24 },
        visible: { opacity: 1, y: 0 },
      }}
      transition={{ duration: prefersReducedMotion ? 0.3 : 0.6, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// How It Works Section - Placeholder
function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-white py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <Reveal delay={0.1}>
          <h2 className="font-heading text-4xl font-semibold leading-relaxed text-grit-green md:text-5xl text-center">How It Works</h2>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="mt-6 max-w-4xl text-lg leading-relaxed text-grit-green/90 text-center mx-auto">
            Assessment pathways: Independent-Led, School-Led, Specialist-Led
          </p>
        </Reveal>
        <Reveal delay={0.3}>
          <div className="mt-12 text-center">
            <p className="text-grit-green/60">Content coming soon...</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export default HowItWorks;
