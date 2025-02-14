"use client"; 

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Main Content with Framer Motion Animations */}
      <main className="flex-grow flex flex-col items-center justify-center text-white text-2xl relative z-10">
        {/* Animated Title */}
        <motion.h1
          initial={{ opacity: 0, y: 50 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 1, ease: "easeOut" }} 
          className="text-white text-5xl font-bold text-center uppercase tracking-wide"
        >
          Welcome to{" "}
          <span className="relative">
            MediLink
          </span>
        </motion.h1>

        {/* Animated Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 30 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 1, delay: 0.3, ease: "easeOut" }} 
          className="text-white text-lg text-center mt-4"
        >
          Your gateway to modern healthcare.
        </motion.p>

      </main>
    </div>
  );
}
