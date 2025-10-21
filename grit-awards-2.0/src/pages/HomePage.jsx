import React, { useEffect, useState } from "react";
import { motion, useAnimation, useScroll, useTransform } from "framer-motion";
import { useInView } from "react-intersection-observer";
import Header from '../components/Header';
import Footer from '../components/Footer';

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

// Cookie Consent Modal with accessibility and fade-in
function CookieConsent() {
  const [open, setOpen] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  
  useEffect(() => {
    const accepted = localStorage.getItem("grit_cookie_consent");
    if (!accepted) setOpen(true);
    
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
  }, []);
  
  const accept = () => {
    localStorage.setItem("grit_cookie_consent", "true");
    setOpen(false);
  };
  
  if (!open) return null;
  
  return (
    <motion.div 
      className="fixed inset-x-0 bottom-0 z-50 p-4"
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: prefersReducedMotion ? 0.2 : 0.3, ease: "easeOut" }}
      role="dialog"
      aria-labelledby="cookie-title"
      aria-describedby="cookie-description"
    >
      <div className="mx-auto max-w-6xl rounded-2xl bg-white/80 shadow-xl ring-1 ring-grit-gold-light/60 backdrop-blur-md">
        <div className="flex flex-col items-start gap-4 p-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 id="cookie-title" className="sr-only">Cookie Consent</h3>
            <p id="cookie-description" className="text-sm text-grit-green/90">
              We use cookies to ensure you get the best experience on our site.
            </p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={accept}
              aria-label="Accept cookies"
              className="rounded-xl bg-grit-green px-4 py-2 text-sm font-medium text-white hover:bg-grit-green/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-grit-gold-dark"
            >
              Accept
            </button>
            <a 
              href="/privacy" 
              className="text-sm underline underline-offset-4 text-grit-green/80 hover:text-grit-green"
              aria-label="Learn more about our privacy policy"
            >
              Learn More
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Hero Section with parallax background
function Hero() {
  const [isMounted, setIsMounted] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
    
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handleChange = (e) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);
  
  const { scrollYProgress } = useScroll();
  const yBg = useTransform(scrollYProgress, [0, 0.3], ["0%", "20%"]);
  const yFg = useTransform(scrollYProgress, [0, 0.3], ["0%", "-10%"]);
  const scrimOpacity = useTransform(scrollYProgress, [0, 0.3], [0.25, 0.45]);

  return (
    <section className="relative isolate min-h-[80vh] overflow-hidden">
      {/* Background image layer */}
      <motion.div 
        style={isMounted && !prefersReducedMotion ? { y: yBg } : undefined} 
        className="absolute inset-0 -z-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: prefersReducedMotion ? 0.3 : 1.2, ease: "easeOut" }}
      >
        <img 
          src="/grit-hero.webp" 
          alt="Children tackling GRIT challenges" 
          className="h-full w-full object-cover" 
          loading="eager"
          decoding="async"
          fetchPriority="high"
        />
      </motion.div>
      {/* Dark gradient overlay for text readability */}
      <div className="absolute inset-0 -z-15 bg-gradient-to-b from-black/60 via-black/40 to-transparent" />
      {/* Light gradient scrim */}
      <motion.div 
        style={isMounted && !prefersReducedMotion ? { opacity: scrimOpacity } : { opacity: 0.3 }} 
        className="absolute inset-0 -z-10 bg-gradient-to-b from-white/90 via-white/70 to-white" 
      />

      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-24 md:gap-8 md:py-36">
        <motion.h1 
          style={isMounted && !prefersReducedMotion ? { y: yFg } : undefined} 
          initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 24 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: prefersReducedMotion ? 0.3 : 0.7, ease: "easeOut" }} 
          className="max-w-4xl font-heading text-5xl font-semibold leading-snug text-white drop-shadow-lg md:text-6xl"
        >
          Building life‑ready children through real experiences and resilience
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.08 }} 
          className="max-w-3xl text-xl leading-relaxed text-grit-gold-light drop-shadow-md"
        >
          GRIT helps young people grow confidence, character, and community — safely, practically, and with joy.
        </motion.p>
        <motion.div 
          initial={{ opacity: 0, y: 18 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.16 }} 
          className="mt-4 flex flex-wrap items-center gap-3 space-y-3 sm:space-y-0"
        >
          <motion.a 
            href="#get-started" 
            whileHover={prefersReducedMotion ? {} : { scale: 1.05, y: -2, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }} 
            whileTap={prefersReducedMotion ? {} : { scale: 0.97 }} 
            transition={prefersReducedMotion ? { duration: 0.2 } : { type: "spring", stiffness: 300, damping: 20 }} 
            className="rounded-2xl bg-grit-green px-6 py-3 text-white shadow-lg hover:bg-grit-green/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-grit-gold-dark"
            aria-label="Get started with GRIT Awards"
          >
            Get Started
          </motion.a>
          <motion.a 
            href="#what-is-grit" 
            whileHover={prefersReducedMotion ? {} : { scale: 1.05, y: -2, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }} 
            whileTap={prefersReducedMotion ? {} : { scale: 0.97 }} 
            transition={prefersReducedMotion ? { duration: 0.2 } : { type: "spring", stiffness: 300, damping: 20 }} 
            className="rounded-2xl border border-white/60 bg-white/90 backdrop-blur-sm px-6 py-3 text-grit-green hover:border-white/80 hover:bg-white"
            aria-label="Learn more about GRIT Awards"
          >
            Learn More
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}

// What is GRIT Section
function WhatIsGrit() {
  return (
    <section id="what-is-grit" className="bg-white py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-6">
        <Reveal delay={0.1}>
          <h2 className="font-heading text-4xl font-semibold leading-relaxed text-grit-green md:text-5xl">What is <span className="text-grit-gold-dark">GRIT</span>?</h2>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="mt-6 max-w-4xl text-lg leading-relaxed text-grit-green/90">
            GRIT is a UKMS-led approach that blends outdoor challenges, real-world projects, and reflective practice to build resilience.
            We create safe, structured experiences that help children discover who they are, what they can do, and how to thrive — at home, at school, and in their communities.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

// For Parents Section
function ForParents() {
  return (
    <section id="for-parents" className="relative overflow-hidden bg-grit-gold-light/10 py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-6">
        <Reveal delay={0.1}>
          <h2 className="font-heading text-4xl font-semibold leading-relaxed text-grit-green md:text-5xl">For Parents — <span className="text-grit-gold-dark">confidence begins at home.</span></h2>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="mt-6 max-w-4xl text-lg leading-relaxed text-grit-green/90">
            You want your child to feel safe, brave, and ready for life.
            GRIT gives you simple, supported ways to build confidence together — from micro-adventures to meaningful routines that reduce anxiety and grow independence.
          </p>
        </Reveal>
        <Reveal delay={0.3}>
          <div className="mt-8 space-y-4">
            <div className="flex gap-4">
              <div className="mt-1 h-2 w-2 rounded-full bg-grit-gold-dark flex-shrink-0" />
              <p className="text-grit-green/90">Safe, age-appropriate challenges that spark growth</p>
            </div>
            <div className="flex gap-4">
              <div className="mt-1 h-2 w-2 rounded-full bg-grit-gold-dark flex-shrink-0" />
              <p className="text-grit-green/90">Clear guidance you can use at home immediately</p>
            </div>
            <div className="flex gap-4">
              <div className="mt-1 h-2 w-2 rounded-full bg-grit-gold-dark flex-shrink-0" />
              <p className="text-grit-green/90">Track progress and celebrate real gains</p>
            </div>
          </div>
        </Reveal>
        <Reveal delay={0.4}>
          <div className="mt-8 flex flex-wrap gap-3">
            <motion.a 
              href="#get-started" 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }} 
              className="rounded-2xl bg-grit-green px-6 py-3 text-white hover:bg-grit-green/90"
            >
              Build Confidence at Home
            </motion.a>
            <motion.a 
              href="#what-is-grit" 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }} 
              className="rounded-2xl border border-grit-green/20 bg-white px-6 py-3 text-grit-green hover:border-grit-green/40"
            >
              How GRIT Works
            </motion.a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// For Schools & Trusts Section
function ForSchools() {
  return (
    <section id="for-schools" className="bg-white py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-6">
        <Reveal delay={0.1}>
          <h2 className="font-heading text-4xl font-semibold leading-relaxed text-grit-green md:text-5xl">For Schools & Trusts — <span className="text-grit-gold-dark">outcomes, structure, partnership.</span></h2>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="mt-6 max-w-4xl text-lg leading-relaxed text-grit-green/90">
            We partner with schools to deliver measurable improvements in wellbeing, attendance, and readiness to learn.
            GRIT fits alongside your curriculum with clear frameworks, safeguarding, and staff support.
          </p>
        </Reveal>
        <Reveal delay={0.3}>
          <div className="mt-8 space-y-4">
            <div className="flex gap-4">
              <div className="mt-1 h-2 w-2 rounded-full bg-grit-gold-dark flex-shrink-0" />
              <p className="text-grit-green/90">Structured programmes with clear outcomes</p>
            </div>
            <div className="flex gap-4">
              <div className="mt-1 h-2 w-2 rounded-full bg-grit-gold-dark flex-shrink-0" />
              <p className="text-grit-green/90">Safeguarding and risk-assessed delivery</p>
            </div>
            <div className="flex gap-4">
              <div className="mt-1 h-2 w-2 rounded-full bg-grit-gold-dark flex-shrink-0" />
              <p className="text-grit-green/90">Staff CPD and simple implementation</p>
            </div>
          </div>
        </Reveal>
        <Reveal delay={0.4}>
          <motion.a 
            href="#get-started" 
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.95 }} 
            className="inline-block mt-8 rounded-2xl bg-grit-green px-6 py-3 text-white hover:bg-grit-green/90"
          >
            Partner With Us
          </motion.a>
        </Reveal>
      </div>
    </section>
  );
}

// Impact & Community Section
function ImpactCommunity() {
  const stats = [
    { number: "40,000+", label: "children" },
    { number: "250+", label: "schools" },
    { number: "2009", label: "established" },
  ];
  
  return (
    <section id="impact" className="bg-grit-gold-light/10 py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-6 text-center">
        <Reveal delay={0.1}>
          <h2 className="font-heading text-4xl font-semibold leading-relaxed text-grit-green md:text-5xl">Impact & <span className="text-grit-gold-dark">Community</span></h2>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="mt-6 max-w-4xl mx-auto text-lg leading-relaxed text-grit-green/90">
            We're proud of the measurable difference GRIT makes across the UK — and the families, schools, and communities who make it real.
          </p>
        </Reveal>
        <Reveal delay={0.3}>
          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-3">
            {stats.map((stat, i) => (
              <div key={stat.label} className="rounded-2xl bg-white p-6 shadow-lg">
                <div className="font-heading text-4xl font-bold text-grit-green">{stat.number}</div>
                <div className="mt-2 text-grit-green/80">{stat.label}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// Join the Movement Section
function JoinMovement() {
  return (
    <section className="bg-grit-green py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-6 text-center">
        <Reveal delay={0.1}>
          <h2 className="font-heading text-4xl font-semibold leading-relaxed text-white md:text-5xl">Join the <span className="text-grit-gold-light">GRIT Movement</span></h2>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="mt-6 max-w-4xl mx-auto text-lg leading-relaxed text-grit-gold-light">
            Become part of the national network helping children grow life-ready skills.
            Whether at home, in school, or in your community — together, we're shaping the future.
          </p>
        </Reveal>
        <Reveal delay={0.3}>
          <motion.a 
            href="#get-started" 
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.95 }} 
            className="inline-block mt-8 rounded-2xl bg-white px-8 py-3 text-grit-green font-semibold hover:bg-grit-gold-light/20 transition-colors"
          >
            Join GRIT
          </motion.a>
        </Reveal>
      </div>
    </section>
  );
}

// Main HomePage Component
export default function HomePage() {
  return (
    <div className="font-body text-grit-green">
      <Header />
      <Hero />
      <WhatIsGrit />
      <ForParents />
      <ForSchools />
      <ImpactCommunity />
      <JoinMovement />
      <Footer />
      <CookieConsent />
    </div>
  );
}