

import React, { useEffect, useState } from "react";
import { motion, useAnimation, useScroll, useTransform } from "framer-motion";
import { useInView } from "react-intersection-observer";
import Header from '../components/Header';
import Footer from '../components/Footer';
import HowItWorks from '../sections/HowItWorks';
import AwardLevels from '../sections/AwardLevels';

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

    const handleChange = (e) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const acceptAll = () => {
    localStorage.setItem("grit_cookie_consent", "accepted_all");
    setOpen(false);
  };

  const rejectAll = () => {
    localStorage.setItem("grit_cookie_consent", "rejected_all");
    setOpen(false);
  };

  const openSettings = () => {
    // TODO: Implement cookie settings modal
    console.log("Open cookie settings");
  };

  if (!open) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: prefersReducedMotion ? 0.3 : 0.6, ease: "easeOut" }}
      className="fixed inset-x-0 bottom-0 z-50 p-4"
      role="dialog"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-description"
    >
      <div className="mx-auto max-w-6xl rounded-xl bg-white shadow-lg shadow-black/5">
        <div className="p-4 md:p-5">
          <h2 id="cookie-consent-title" className="sr-only">Cookie Consent</h2>
          <p id="cookie-consent-description" className="text-sm text-grit-green/90 mb-6 leading-relaxed">
            We use cookies (or similar technology) to provide website functionality, analyse site usage, enhance your experience, provide tailored content, improve our service, and for marketing. By clicking 'Accept All Cookies', you agree to such purposes and the collection and sharing of your data with our partners. You can find out more in our Cookie Policy and withdraw or adjust your consent at any time.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              onClick={openSettings}
              className="text-sm text-grit-gold-light hover:text-grit-gold-dark underline underline-offset-4 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-grit-gold-dark focus-visible:ring-offset-2"
              aria-label="Open cookie settings"
            >
              Cookie Settings
            </button>
            <div className="flex gap-3 sm:gap-4">
              <button
                onClick={rejectAll}
                className="rounded-xl border border-grit-green px-4 py-2 text-sm font-medium text-grit-green hover:bg-grit-green/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-grit-gold-dark focus-visible:ring-offset-2"
                aria-label="Reject all cookies"
              >
                Reject All
              </button>
              <button
                onClick={acceptAll}
                className="rounded-xl bg-grit-green px-4 py-2 text-sm font-medium text-white hover:bg-grit-green/90 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-grit-gold-dark focus-visible:ring-offset-2"
                aria-label="Accept all cookies"
              >
                Accept All Cookies
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Hero Section with parallax background
function Hero() {
  const [isPaused, setIsPaused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  
  const images = [
    { src: "/hero1.webp", alt: "Children taking part in GRIT Awards activities" },
    { src: "/hero2.webp", alt: "Students building confidence through real experiences" },
    { src: "/hero3.webp", alt: "Young people developing resilience and character" }
  ];

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handleChange = (e) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  return (
    <section 
      className="relative isolate h-[80vh] md:h-[90vh] overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Continuous horizontal scrolling background */}
      <div className="absolute inset-0 -z-20">
        <motion.div
          className="flex h-full w-[400%]"
          animate={prefersReducedMotion || isPaused ? {} : { x: "-100%" }}
          transition={{
            duration: 35,
            ease: "linear",
            repeat: Infinity,
            repeatType: "loop"
          }}
        >
          {/* First set of images */}
          {images.map((image, index) => (
            <div key={`first-${index}`} className="relative h-full flex-[0_0_25%]">
              <img
                src={image.src}
                alt={image.alt}
                className="w-full h-full object-cover"
                loading={index === 0 ? "eager" : "lazy"}
                decoding="async"
                fetchPriority={index === 0 ? "high" : "low"}
              />
            </div>
          ))}
          {/* Duplicate first image for seamless loop */}
          <div className="relative h-full flex-[0_0_25%]">
            <img
              src={images[0].src}
              alt={images[0].alt}
              className="w-full h-full object-cover"
              loading="lazy"
              decoding="async"
            />
          </div>
        </motion.div>
        </div>

      {/* GRIT green gradient overlay */}
      <div className="absolute inset-0 -z-15 bg-gradient-to-b from-grit-green/40 via-grit-green/20 to-grit-green/10" />
      
      {/* Dark gradient overlay for text readability */}
      <div className="absolute inset-0 -z-14 bg-gradient-to-b from-black/60 via-black/40 to-black/20" />

      {/* Content */}
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-24 md:gap-8 md:py-36 h-full justify-center">
        <motion.h1 
          initial={{ opacity: 0, y: 24 }} 
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
          The GRIT Awards help young people grow confidence, character, and community — safely, practically, and with joy.
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
            
      {/* Pause/Play control */}
      <motion.button
        onClick={togglePause}
        className="absolute bottom-6 right-6 z-10 rounded-full bg-black/20 backdrop-blur-sm p-2 text-white hover:bg-black/40 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-grit-gold-dark"
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        aria-label={isPaused ? "Resume background scroll" : "Pause background scroll"}
      >
        {isPaused ? (
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M8 5v10l8-5-8-5z" />
          </svg>
        ) : (
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M6 4h2v12H6V4zm6 0h2v12h-2V4z" />
          </svg>
        )}
      </motion.button>
    </section>
  );
}

    // What is GRIT Section
    function WhatIsGrit() {
      const cards = [
        {
          title: "Grow",
          description: "Children develop new skills and confidence through age-appropriate challenges and structured learning experiences."
        },
        {
          title: "Resilience", 
          description: "Building the ability to bounce back from setbacks and persevere through difficulties with practical support."
        },
        {
          title: "Integrity & Independence",
          description: "Developing strong character, self-awareness, and the confidence to make good choices independently."
        },
        {
          title: "Transformation",
          description: "Real change that prepares children for life beyond school — confident, capable, and ready for the future."
        }
      ];

    return (
      <section id="what-is-grit" className="bg-gray-50 py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <img 
            src="/screenshots.webp" 
            alt="GRIT Awards app screenshots" 
            className="w-full h-auto mb-10 rounded-2xl"
            loading="lazy"
            decoding="async"
          />
          <Reveal delay={0.1}>
            <h2 className="font-heading text-4xl font-semibold leading-relaxed text-grit-green md:text-5xl text-center">What is <span className="text-grit-gold-dark">GRIT</span>?</h2>
          </Reveal>
            <Reveal delay={0.2}>
              <p className="mt-6 max-w-4xl text-lg leading-relaxed text-grit-green/80 text-center mx-auto">
                The GRIT Awards inspire children to <strong>Grow</strong>, build <strong>Resilience</strong>, develop <strong>Integrity and Independence</strong>, and experience a <strong>Transformation</strong> for good. They're a UKMS-led initiative giving schools and families a structured way to help children gain real-world skills and confidence.
              </p>
            </Reveal>
            <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {cards.map((card, index) => (
                <Reveal key={card.title} delay={0.1 + (index * 0.1)}>
                  <div className="bg-white rounded-2xl p-6 shadow-md border border-grit-gold-light/40 hover:shadow-lg transition-all ease-out duration-200">
                    <h3 className="font-heading text-xl font-semibold text-grit-green mb-3">{card.title}</h3>
                    <p className="text-grit-green/80">{card.description}</p>
            </div>
                </Reveal>
              ))}
            </div>
            <Reveal delay={0.5}>
              <div className="mt-12 text-center">
                <motion.a 
                  href="#for-parents" 
                  whileHover={{ scale: 1.05 }} 
                  whileTap={{ scale: 0.95 }} 
                  className="inline-block rounded-2xl bg-grit-green px-8 py-4 text-white font-semibold hover:bg-grit-green/90 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-grit-gold-dark"
                  aria-label="Learn more about GRIT for parents"
                >
                  Learn More
                </motion.a>
          </div>
            </Reveal>
        </div>
      </section>
      );
    }

    // For Parents Section
    function ForParents() {
      return (
        <section id="for-parents" className="bg-white py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <Reveal delay={0.1}>
                <div>
                  <h2 className="font-heading text-4xl font-semibold leading-relaxed text-grit-green md:text-5xl">For Parents</h2>
                  <p className="mt-6 text-lg leading-relaxed text-grit-green/80">
                    Confidence begins at home. The GRIT Awards give you practical, age-appropriate challenges and clear guidance to help your child develop real-world skills. Track their progress together and celebrate their growth beyond academics.
                  </p>
                  <div className="mt-8 space-y-4">
                    <div className="flex gap-4 items-start">
                      <div className="mt-1 h-2 w-2 rounded-full bg-grit-gold-dark flex-shrink-0" />
                      <p className="text-grit-green/80">Age-appropriate challenges that build confidence step by step</p>
                </div>
                    <div className="flex gap-4 items-start">
                      <div className="mt-1 h-2 w-2 rounded-full bg-grit-gold-dark flex-shrink-0" />
                      <p className="text-grit-green/80">Clear guidance and support materials for home activities</p>
              </div>
                    <div className="flex gap-4 items-start">
                      <div className="mt-1 h-2 w-2 rounded-full bg-grit-gold-dark flex-shrink-0" />
                      <p className="text-grit-green/80">Progress tracking that connects home and school</p>
                </div>
              </div>
                  <div className="mt-8">
                    <motion.a 
                      href="#get-started" 
                      whileHover={{ scale: 1.05 }} 
                      whileTap={{ scale: 0.95 }} 
                      className="inline-block rounded-2xl bg-grit-green px-8 py-4 text-white font-semibold hover:bg-grit-green/90 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-grit-gold-dark"
                      aria-label="Get started to build confidence at home"
                    >
                      Build Confidence at Home
                    </motion.a>
                </div>
                </div>
              </Reveal>
              <Reveal delay={0.2}>
                <div className="relative">
                  <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-grit-gold-light/20 to-grit-green/10 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-grit-green/20 flex items-center justify-center">
                        <svg className="w-8 h-8 text-grit-green" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                        </svg>
              </div>
                      <p className="text-grit-green/70 font-medium">Family & Child Visual</p>
                </div>
              </div>
                </div>
              </Reveal>
          </div>
        </div>
      </section>
      );
    }

    // For Schools & Trusts Section
    function ForSchools() {
      return (
        <section id="for-schools" className="bg-gray-50 py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-6">
            <Reveal delay={0.1}>
              <h2 className="font-heading text-4xl font-semibold leading-relaxed text-grit-green md:text-5xl text-center">For Schools & Trusts</h2>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="mt-6 max-w-4xl text-lg leading-relaxed text-grit-green/80 text-center mx-auto">
                Partner with UKMS to deliver measurable outcomes in student wellbeing and character development. Our safeguarding-first approach integrates seamlessly into your curriculum with clear frameworks and staff support.
              </p>
            </Reveal>
            <Reveal delay={0.3}>
              <div className="mt-12 max-w-3xl mx-auto space-y-6">
                <div className="flex gap-4 items-start">
                  <div className="mt-1 h-2 w-2 rounded-full bg-grit-gold-dark flex-shrink-0" />
                  <p className="text-grit-green/80">Partnership with UKMS — backed by 15+ years of experience</p>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="mt-1 h-2 w-2 rounded-full bg-grit-gold-dark flex-shrink-0" />
                  <p className="text-grit-green/80">Safeguarding-first approach with risk-assessed delivery</p>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="mt-1 h-2 w-2 rounded-full bg-grit-gold-dark flex-shrink-0" />
                  <p className="text-grit-green/80">Measurable outcomes in wellbeing, attendance, and readiness to learn</p>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="mt-1 h-2 w-2 rounded-full bg-grit-gold-dark flex-shrink-0" />
                  <p className="text-grit-green/80">Easy integration with clear frameworks and staff CPD support</p>
                </div>
              </div>
            </Reveal>
            <Reveal delay={0.4}>
              <div className="mt-12 text-center">
                <motion.a 
                  href="#get-started" 
                  whileHover={{ scale: 1.05 }} 
                  whileTap={{ scale: 0.95 }} 
                  className="inline-block rounded-2xl bg-grit-green px-8 py-4 text-white font-semibold hover:bg-grit-green/90 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-grit-gold-dark"
                  aria-label="Partner with GRIT Awards"
                >
                  Partner With Us
                </motion.a>
              </div>
            </Reveal>
        </div>
      </section>
      );
    }

    // Impact & Community Section
    function ImpactCommunity() {
      const stats = [
        { number: "40,000+", label: "students recognised" },
        { number: "250+", label: "schools involved" },
        { number: "2009", label: "established" },
      ];
      
      const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
      
      useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        setPrefersReducedMotion(mediaQuery.matches);
        
        const handleChange = (e) => setPrefersReducedMotion(e.matches);
        mediaQuery.addEventListener('change', handleChange);
        
        return () => mediaQuery.removeEventListener('change', handleChange);
      }, []);
      
      return (
        <section id="impact" className="bg-white py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-6 text-center">
            <Reveal delay={0.1}>
              <h2 className="font-heading text-4xl font-semibold leading-relaxed text-grit-green md:text-5xl">Our Impact</h2>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="mt-6 max-w-4xl mx-auto text-lg leading-relaxed text-grit-green/80">
                Every achievement strengthens community pride and long-term wellbeing.
              </p>
            </Reveal>
            <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-3">
              {stats.map((stat, i) => (
                <Reveal key={stat.label} delay={0.3 + (i * 0.1)}>
                  <motion.div 
                    className="rounded-2xl bg-white p-8 shadow-md border border-grit-gold-light/40 hover:shadow-lg transition-all ease-out duration-200"
                    initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
                    whileInView={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: prefersReducedMotion ? 0.3 : 0.5, delay: i * 0.1 }}
                  >
                    <div className="font-heading text-4xl font-bold text-grit-green mb-2">{stat.number}</div>
                    <div className="text-grit-green/80 font-medium">{stat.label}</div>
                  </motion.div>
                </Reveal>
              ))}
            </div>
              </div>
        </section>
      );
    }

    // Join the Movement Section
    function JoinMovement() {
      return (
        <section className="relative overflow-hidden bg-grit-green py-20 md:py-28">
          <div className="absolute inset-0 bg-gradient-to-br from-grit-green via-grit-green to-grit-green/90" />
          <div className="relative mx-auto max-w-7xl px-6 text-center">
            <Reveal delay={0.1}>
              <h2 className="font-heading text-4xl font-semibold leading-relaxed text-white md:text-5xl">Join the GRIT Movement</h2>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="mt-6 max-w-4xl mx-auto text-lg leading-relaxed text-white/90">
                Become part of the national network helping children grow life-ready skills. Whether at home, in school, or in your community — together, we're shaping the future.
              </p>
            </Reveal>
            <Reveal delay={0.3}>
              <motion.a 
                href="#get-started" 
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }} 
                className="inline-block mt-8 rounded-2xl bg-white px-8 py-4 text-grit-green font-semibold hover:bg-grit-gold-light/30 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                aria-label="Join the GRIT movement"
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
      <HowItWorks />
      <AwardLevels />
      <ImpactCommunity />
      <JoinMovement />
      <Footer />
      <CookieConsent />
    </div>
  );
}


