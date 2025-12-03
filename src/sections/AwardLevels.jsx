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

// Award Levels Section
function AwardLevels() {
  const awards = [
    {
      name: "Hastings Award",
      age: "5–7 years",
      duration: "1 academic year",
      objectives: "30 objectives"
    },
    {
      name: "Trafalgar Award", 
      age: "8–9 years",
      duration: "1 academic year",
      objectives: "50 objectives"
    },
    {
      name: "Waterloo Award",
      age: "9–11 years", 
      duration: "1 academic year",
      objectives: "70 objectives"
    }
  ];

  return (
    <section id="award-levels" className="bg-gray-50 py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <Reveal delay={0.1}>
          <h2 className="font-heading text-4xl font-semibold leading-relaxed text-grit-green md:text-5xl text-center">Award <span className="text-grit-gold-dark">Levels</span></h2>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="mt-6 max-w-4xl text-lg leading-relaxed text-grit-green/90 text-center mx-auto">
            Three progressive levels designed to build character and resilience as children grow and develop.
          </p>
        </Reveal>
        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {awards.map((award, index) => (
            <Reveal key={award.name} delay={0.1 + (index * 0.1)}>
              <div className="rounded-2xl bg-white p-6 shadow border border-grit-gold-light/50 text-center hover:shadow-lg transition-all ease-out duration-200">
                <h3 className="font-heading text-2xl font-bold text-grit-green mb-4">{award.name}</h3>
                <div className="space-y-2 text-sm text-grit-green/70">
                  <p><span className="font-medium">Age:</span> {award.age}</p>
                  <p><span className="font-medium">Duration:</span> {award.duration}</p>
                  <p><span className="font-medium">Criteria:</span> {award.objectives}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export default AwardLevels;
