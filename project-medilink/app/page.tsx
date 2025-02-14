"use client"; 

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Navbar */}
      <nav className="w-full bg-white shadow-md flex justify-between items-center px-6 py-4 fixed top-0 z-10">
        
        {/* Left: MediLink Logo (Now a Home Button) */}
        <Link href="/">
          <Image
            src="/medilink-logo.png"
            alt="MediLink Logo"
            width={150}
            height={40}
            className="cursor-pointer"
          />
        </Link>

        {/* Center: Navigation Links */}
        <div className="flex space-x-6">
          <Link href="/" className="text-gray-700 hover:text-gray-900 text-lg">
            Home
          </Link>
          <Link href="/about" className="text-gray-700 hover:text-gray-900 text-lg">
            About
          </Link>
          <Link href="/chat" className="text-gray-700 hover:text-gray-900 text-lg">
            Chat.io
          </Link>
        </div>

        {/* Right: Clickable Profile Icon */}
        <Link href="/profile">
          <Image
            src="/profile-icon.png"
            alt="Profile"
            width={40}
            height={40}
            className="rounded-full cursor-pointer"
          />
        </Link>
      </nav>

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
            <span className="absolute inset-0 bg-[#00BCD4]/20 blur-sm"></span>
          </span>
          !
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
