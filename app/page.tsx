"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

export default function Home() {
  const secondSectionRef = useRef<HTMLDivElement>(null);
  const words = ["Efficient", "Healthcare", "Revolutionary", "Convenient", "Connected"];
  const [index, setIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Set initial loading state and remove background
    document.body.classList.add('homepage', 'page-loading');

    // Pre-load the script
    const preloadScript = document.createElement('link');
    preloadScript.rel = 'preload';
    preloadScript.as = 'script';
    preloadScript.href = '/finisher-header.es5.min.js';
    document.head.appendChild(preloadScript);

    // Create and load the script
    const script = document.createElement("script");
    script.src = "/finisher-header.es5.min.js";
    script.async = true;

    script.onload = () => {
      if ((window as any).FinisherHeader) {
        new (window as any).FinisherHeader({
          count: 10,
          size: { min: 1300, max: 1500, pulse: 0 },
          speed: { x: { min: 0.1, max: 1 }, y: { min: 0.1, max: 0.6 } },
          colors: {
            background: "#00bcd4",
            particles: ["#ffffff", "#000000", "#00bcd4"],
          },
          blending: "overlay",
          opacity: { center: 0.5, edge: 0.05 },
          skew: 0,
          shapes: ["c"],
        });
        
        // Mark as loaded after initialization
        setIsLoaded(true);
        document.body.classList.remove('page-loading');
        document.body.classList.add('page-loaded');
        
        // Add loaded class to finisher-header
        const finisherHeader = document.querySelector('.finisher-header');
        if (finisherHeader) {
          finisherHeader.classList.add('loaded');
        }
      }
    };

    document.body.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
      if (preloadScript.parentNode) {
        preloadScript.parentNode.removeChild(preloadScript);
      }
      document.body.classList.remove('homepage', 'page-loading', 'page-loaded');
      
      // Remove loaded class from finisher-header
      const finisherHeader = document.querySelector('.finisher-header');
      if (finisherHeader) {
        finisherHeader.classList.remove('loaded');
      }
    };
  }, []);

  // Rotate words every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % words.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`w-full flex flex-col ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}>
      {/* First Section - Welcome */}
      <section className="min-h-screen w-full flex flex-col justify-center items-center relative">
        {/* The animated background fills this .finisher-header area */}
        <div className="finisher-header absolute top-0 left-0 w-full h-full z-0" />

        <motion.h1
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="text-white text-7xl font-bold text-center uppercase tracking-wide relative z-10"
        >
          Welcome to <span className="relative">MediLink</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
          className="text-white text-2xl text-center mt-4 relative z-10"
        >
          Your gateway to modern healthcare.
        </motion.p>

        {/* Scroll Down Indicator */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1, ease: "easeOut" }}
          className="absolute bottom-10 cursor-pointer"
          onClick={() => secondSectionRef.current?.scrollIntoView({ behavior: "smooth" })}
        >
          <span className="text-white text-4xl animate-bounce">↓</span>
        </motion.div>
      </section>

      {/* Second Section - What is MediLink? */}
      <section ref={secondSectionRef} className="min-h-screen flex justify-center items-center px-20 py-24 relative">
        <div className="finisher-header absolute top-0 left-0 w-full h-full z-0" />

        <div className="max-w-7xl flex items-center gap-16 relative z-10">
          {/* Your plus shape & rotating words */}
          <div className="relative flex justify-center items-center w-72 h-72">
            <div className="relative w-72 h-72 flex justify-center items-center">
              <div className="absolute w-52 h-20 bg-[#00BCD4] rounded-xl shadow-lg"></div>
              <div className="absolute w-20 h-52 bg-[#00BCD4] rounded-xl shadow-lg"></div>

              <motion.span
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="absolute text-white text-6xl font-bold"
              >
                {words[index]}
              </motion.span>
            </div>
          </div>

          {/* MediLink Description */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            viewport={{ once: true }}
            className="text-white max-w-2xl"
          >
            <h2 className="text-6xl font-bold mb-6 border-l-8 border-white pl-6 leading-tight">
              What is MediLink?
            </h2>
            <p className="text-2xl leading-relaxed tracking-wide">
              MediLink is revolutionizing healthcare by making it easier for
              patients to find the right doctor. Powered by AI, we instantly
              connect users with nearby healthcare professionals based on their
              symptoms—reducing delays and ensuring faster access to care.
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
