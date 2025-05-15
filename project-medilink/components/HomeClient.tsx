"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Script from "next/script";

export default function HomeClient() {
    const instanceRef = useRef<any>(null);
    const secondSectionRef = useRef<HTMLDivElement>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [index, setIndex] = useState(0);

    const words = [
        "Efficient",
        "Healthcare",
        "Revolutionary",
        "Convenient",
        "Connected",
    ];

    // 1️⃣ Tear down on unmount
    useEffect(() => {
        return () => {
            instanceRef.current?.destroy?.();
            document.body.classList.remove("page-loaded");
            instanceRef.current = null;
        };
    }, []);

    // 2️⃣ rAF-throttled word rotator
    useEffect(() => {
        let frameId: number;
        let last = performance.now();

        function tick(now: number) {
            if (now - last >= 2000) {
                setIndex((i) => (i + 1) % words.length);
                last = now;
            }
            frameId = requestAnimationFrame(tick);
        }

        frameId = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frameId);
    }, []);

    // 3️⃣ Pause/play on tab hidden/visible
    useEffect(() => {
        function onVis() {
            if (document.hidden) instanceRef.current?.pause?.();
            else instanceRef.current?.play?.();
        }
        document.addEventListener("visibilitychange", onVis);
        return () => document.removeEventListener("visibilitychange", onVis);
    }, []);

    return (
        <div
            className={`relative w-full flex flex-col ${
                isLoaded ? "opacity-100" : "opacity-0"
            } transition-opacity duration-300`}
        >
            {/* Load & init FinisherHeader */}
            <Script
                src="/finisher-header.es5.min.js"
                strategy="afterInteractive"
                onLoad={() => {
                    if ((window as any).FinisherHeader && !instanceRef.current) {
                        instanceRef.current = new (window as any).FinisherHeader({
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
                        setIsLoaded(true);
                        document.body.classList.add("page-loaded");
                        instanceRef.current.el.classList.add("loaded");
                    }
                }}
            />

            {/* Single shared finisher-header canvas */}
            <div
                className="finisher-header absolute inset-0 z-0"
                style={{ pointerEvents: "none", contain: "paint" }}
            />

            {/* ===== First Section ===== */}
            <section className="min-h-screen w-full flex flex-col justify-center items-center relative z-10">
                <motion.h1
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="text-white text-7xl font-bold text-center uppercase tracking-wide"
                >
                    Welcome to <span className="relative">MediLink</span>
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                    className="text-white text-2xl text-center mt-4"
                >
                    Your gateway to modern healthcare.
                </motion.p>
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 1, ease: "easeOut" }}
                    className="absolute bottom-10 cursor-pointer"
                    onClick={() =>
                        secondSectionRef.current?.scrollIntoView({ behavior: "smooth" })
                    }
                >
                    <span className="text-white text-4xl animate-bounce">↓</span>
                </motion.div>
            </section>

            {/* ===== Second Section ===== */}
            <section
                ref={secondSectionRef}
                className="min-h-screen flex justify-center items-center px-2 py-5 md:px-20 md:py-24 relative z-10"
            >
                <div className="max-w-7xl flex flex-col md:flex-row items-center gap-8 md:gap-16">
                    <div className="relative flex justify-center items-center w-48 h-48 md:w-72 md:h-72">
                        <div className="absolute w-32 h-12 md:w-52 md:h-20 bg-[#00BCD4] rounded-xl shadow-lg" />
                        <div className="absolute w-12 h-32 md:w-20 md:h-52 bg-[#00BCD4] rounded-xl shadow-lg" />
                        <motion.span
                            key={index}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="absolute text-white text-4xl md:text-6xl font-bold"
                        >
                            {words[index]}
                        </motion.span>
                    </div>
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        viewport={{ once: true }}
                        className="text-white max-w-2xl px-4 md:px-0"
                    >
                        <h2 className="text-4xl md:text-6xl font-bold mb-4 md:mb-6 border-l-4 md:border-l-8 border-white pl-4 md:pl-6 leading-tight">
                            What is MediLink?
                        </h2>
                        <p className="text-xl md:text-2xl leading-relaxed tracking-wide">
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