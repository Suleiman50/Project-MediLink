"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import "./globals.css";

// If "Geist" or "Geist_Mono" cause errors, remove or replace them with valid Google fonts.
// import { Geist, Geist_Mono } from "next/font/google";
// const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
// const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close the mobile menu when the user scrolls
  useEffect(() => {
    const handleScroll = () => {
      if (isMobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isMobileMenuOpen]);

  // Prevent body from scrolling when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";
  }, [isMobileMenuOpen]);

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <html>
      <body className="min-h-screen">
        {/* Global Navigation Bar */}
        <nav className="w-full bg-white shadow-md flex justify-between items-center px-6 py-4 fixed top-0 z-50">
          {/* Logo (Home Button) */}
          <Link href="/">
            <Image
              src="/medilink-logo.png"
              alt="MediLink Logo"
              width={150}
              height={40}
              className="cursor-pointer"
            />
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex space-x-8">
            <Link href="/" className="nav-link">
              Home
            </Link>
            <Link href="/chat" className="nav-link">
              Chat
            </Link>
            <Link href="/search" className="nav-link">
              Search
            </Link>
          </div>

          {/* Right side (Burger Button on mobile + Profile Icon) */}
          <div className="flex items-center">
            {/* Profile Icon */}
            <Link href="/profile">
              <Image
                src="/profile-icon.png"
                alt="Profile"
                width={40}
                height={40}
                className="rounded-full cursor-pointer"
              />
            </Link>

            {/* Mobile Burger Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden mr-4"
            >
              <Image
                src="/Menu.svg"
                alt="Menu"
                width={40}
                height={40}
                className={`cursor-pointer transition-transform duration-300 ${
                  isMobileMenuOpen ? "rotate-90" : ""
                }`}
              />
            </button>
          </div>
        </nav>

        {/* Mobile Navigation Overlay */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-40" onClick={closeMenu}>
            <div
              className="absolute top-16 left-0 w-full bg-white shadow-md flex flex-col items-center space-y-4 py-4 transition-transform duration-300"
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the menu
            >
              <Link href="/" onClick={closeMenu} className="nav-link">
                Home
              </Link>
              <Link href="/about" onClick={closeMenu} className="nav-link">
                About
              </Link>
              <Link href="/chat" onClick={closeMenu} className="nav-link">
                Chat
              </Link>
              <Link href="/search" onClick={closeMenu} className="nav-link">
                Search
              </Link>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="min-h-screen w-full">
          {children}
        </div>
      </body>
    </html>
  );
}
