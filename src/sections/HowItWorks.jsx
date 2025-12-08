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

// How It Works Section
function HowItWorks() {
  const pathways = [
    {
      title: "Parent/Carer",
      summary: "Children take ownership of their learning journey at home with family support.",
      examples: [
        "Learning to tie shoelaces independently",
        "Preparing a healthy packed lunch",
        "Organising their bedroom and school bag",
        "Practising basic cooking skills"
      ]
    },
    {
      title: "School", 
      summary: "Teachers guide students through structured activities within the classroom setting.",
      examples: [
        "Leading a class discussion or presentation",
        "Helping younger students with reading",
        "Organising classroom resources and displays",
        "Taking responsibility for class pets or plants"
      ]
    },
    {
      title: "Specialist",
      summary: "UKMS-trained specialists deliver outdoor challenges and adventure-based learning.",
      examples: [
        "Team building activities and problem-solving challenges",
        "Outdoor cooking and camp craft skills",
        "Navigation and map reading exercises",
        "Leadership roles during outdoor expeditions"
      ]
    }
  ];

  return (
    <section id="how-it-works" className="bg-white py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <Reveal delay={0.1}>
          <h2 className="font-heading text-4xl font-semibold leading-relaxed text-grit-green md:text-5xl text-center">How GRIT Works <span className="text-grit-gold-dark">Three Assessment Pathways</span></h2>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="mt-6 max-w-4xl text-lg leading-relaxed text-grit-green/80 text-center mx-auto">
            Each pathway builds different aspects of character and resilience, creating a comprehensive approach to developing life-ready skills.
          </p>
        </Reveal>
        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {pathways.map((pathway, index) => (
            <Reveal key={pathway.title} delay={0.1 + (index * 0.1)}>
              <div className="rounded-2xl bg-white shadow-md border border-grit-gold-light/40 hover:shadow-lg transition-all ease-out duration-200 p-6">
                <h3 className="font-heading text-2xl font-semibold text-grit-green mb-4">{pathway.title}</h3>
                <p className="text-grit-green/80 mb-6 leading-relaxed">{pathway.summary}</p>
                <div className="space-y-3">
                  <h4 className="font-medium text-grit-green text-sm uppercase tracking-wide">Examples:</h4>
                  <ul className="space-y-2">
                    {pathway.examples.map((example, exampleIndex) => (
                      <li key={exampleIndex} className="flex items-start gap-3">
                        <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-grit-gold-dark flex-shrink-0" />
                        <span className="text-sm text-grit-green/80">{example}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;
