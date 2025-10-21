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

// Hero Section with reduced motion support
function Hero() {
  return (
    <section className="relative bg-gradient-to-br from-grit-green via-grit-green/90 to-grit-green/80 py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-6 text-center">
        <Reveal delay={0.1}>
          <h1 className="font-heading text-4xl font-bold text-white md:text-6xl">
            Building life-ready children through real experiences and resilience
          </h1>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="mt-6 max-w-3xl mx-auto text-xl text-grit-gold-light">
            Empowering children with essential life skills through structured achievement and character development.
          </p>
        </Reveal>
        <Reveal delay={0.3}>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <motion.a 
              href="#get-started" 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }} 
              className="rounded-xl bg-white px-8 py-3 text-grit-green font-semibold hover:bg-grit-gold-light/20 transition-colors"
            >
                Get Started
            </motion.a>
            <motion.a 
              href="#what-is-grit" 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }} 
              className="rounded-xl border-2 border-white px-8 py-3 text-white font-semibold hover:bg-white hover:text-grit-green transition-colors"
            >
              Learn More
            </motion.a>
          </div>
        </Reveal>
        </div>
      </section>
  );
}

// What is GRIT Section
function WhatIsGrit() {
  return (
    <section id="what-is-grit" className="bg-white py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-6 text-center">
        <Reveal delay={0.1}>
          <h2 className="font-heading text-3xl font-bold text-grit-green md:text-4xl">
            What is <span className="text-grit-gold-dark">GRIT</span>?
            </h2>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="mt-6 max-w-4xl mx-auto text-lg text-grit-green/80">
            Since 2009, UK Military School has been building life-ready children through structured achievement recognition and character development. The GRIT Awards turn that expertise into a clear pathway every family and school can follow.
          </p>
        </Reveal>
        </div>
      </section>
  );
}

// For Parents Section
function ForParents() {
  return (
    <section id="for-parents" className="bg-grit-gold-light/10 py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-6 text-center">
        <Reveal delay={0.1}>
          <h2 className="font-heading text-3xl font-bold text-grit-green md:text-4xl">
            For Parents
            </h2>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="mt-6 max-w-4xl mx-auto text-lg text-grit-green/80">
            Give your child the gift of confidence, independence, and real-world skills. Watch them grow through structured challenges that build character and prepare them for life's adventures.
          </p>
        </Reveal>
        <Reveal delay={0.3}>
          <motion.a 
            href="#get-started" 
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.95 }} 
            className="inline-block mt-8 rounded-xl bg-grit-green px-8 py-3 text-white font-semibold hover:bg-grit-green/90 transition-colors"
          >
            Build Confidence at Home
          </motion.a>
        </Reveal>
        </div>
      </section>
  );
}

// For Schools & Trusts Section
function ForSchools() {
  return (
    <section id="for-schools" className="bg-white py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-6 text-center">
        <Reveal delay={0.1}>
          <h2 className="font-heading text-3xl font-bold text-grit-green md:text-4xl">
            For Schools & Trusts
            </h2>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="mt-6 max-w-4xl mx-auto text-lg text-grit-green/80">
            Embed character education with clear structure, evidence, and outcomes that strengthen personal development, behaviour and welfare across your school community.
          </p>
        </Reveal>
        <Reveal delay={0.3}>
          <motion.a 
            href="#get-started" 
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.95 }} 
            className="inline-block mt-8 rounded-xl bg-grit-green px-8 py-3 text-white font-semibold hover:bg-grit-green/90 transition-colors"
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
    { number: "40,000+", label: "children trained" },
    { number: "250+", label: "schools" },
    { number: "2009", label: "established" },
  ];
  
  return (
    <section id="impact" className="bg-grit-gold-light/10 py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-6 text-center">
        <Reveal delay={0.1}>
          <h2 className="font-heading text-3xl font-bold text-grit-green md:text-4xl">
            Impact & Community
          </h2>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="mt-6 max-w-4xl mx-auto text-lg text-grit-green/80">
            Over a decade of proven results building character, resilience, and life skills in children across the UK.
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
          <h2 className="font-heading text-3xl font-bold text-white md:text-4xl">
            Join the Movement
            </h2>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="mt-6 max-w-4xl mx-auto text-lg text-grit-gold-light">
            GRIT is more than a programme — it's a national effort to raise a resilient generation. Parents, schools and communities working together to build life-ready children.
          </p>
        </Reveal>
        <Reveal delay={0.3}>
          <motion.a 
            href="#get-started" 
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.95 }} 
            className="inline-block mt-8 rounded-xl bg-white px-8 py-3 text-grit-green font-semibold hover:bg-grit-gold-light/20 transition-colors"
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