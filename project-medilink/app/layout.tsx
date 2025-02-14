"use client"; 

import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import Image from "next/image";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        
        {/* Global Navigation Bar */}
        <nav className="w-full bg-white shadow-md flex justify-between items-center px-6 py-4 fixed top-0 z-50">
          
          {/* Logo (Home Button) */}
          <Link href="/">
            <Image src="/medilink-logo.png" alt="MediLink Logo" width={150} height={40} className="cursor-pointer" />
          </Link>

          {/* Navigation Links */}
          <div className="flex space-x-6">
            <Link href="/" className="nav-link">
              Home
            </Link>
            <Link href="/about" className="nav-link">
              About
            </Link>
            <Link href="/chat" className="nav-link">
              Chat.io
            </Link>
          </div>

          {/* Profile Icon (Navigates to Profile Page) */}
          <Link href="/profile">
            <Image src="/profile-icon.png" alt="Profile" width={40} height={40} className="rounded-full cursor-pointer" />
          </Link>
        </nav>

          <div className="min-h-screen bg-black/40 flex items-center justify-center">
            {/* Adds a dark overlay for better contrast */}
            {children}
          </div>
      </body>
    </html>
  );
}
