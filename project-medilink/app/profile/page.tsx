"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<{
    firstName: string;
    lastName: string;
    email: string;
    gender?: string;
    dob?: string;
    profilePic?: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) return;
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    const storedUser = localStorage.getItem("user");

    if (!isLoggedIn || !storedUser) {
      // User not logged in -> instantly redirect
      router.replace("/auth");
    } else {
      // User is logged in -> set state, show page
      setUser(JSON.parse(storedUser));
      setLoading(false);
    }
  }, [router]);

  // ✅ 1) Don’t show anything until we confirm user is valid
  if (loading) {
    return null; // Return nothing (no flicker)
  }

  // ✅ 2) Logged-in user -> show the Profile Page
  return (
      <div
          className="min-h-screen flex flex-col items-center bg-cover bg-center relative px-4"
          style={{ backgroundImage: "url('/background.png')" }}
      >
        {/* Navbar */}
        <nav className="w-full bg-white shadow-md flex justify-between items-center px-6 py-4 fixed top-0 left-0 right-0 z-50">
          {/* Left: Logo */}
          <Image
              src="/medilink-logo.png"
              alt="MediLink Logo"
              width={120}
              height={30}
              className="cursor-pointer"
              onClick={() => router.push("/")}
          />

          {/* Center: Navigation Links */}
          <div className="flex space-x-6">
            <button
                className="text-gray-700 text-lg font-semibold hover:text-[#00BCD4] transition-all"
                onClick={() => router.push("/")}
            >
              Home
            </button>
            <button
                className="text-gray-700 text-lg font-semibold hover:text-[#00BCD4] transition-all"
                onClick={() => router.push("/about")}
            >
              About
            </button>
            <button
                className="text-gray-700 text-lg font-semibold hover:text-[#00BCD4] transition-all"
                onClick={() => router.push("/chat")}
            >
              Chat.io
            </button>
          </div>

          {/* Right: Profile + Sign Out Button */}
          <div className="flex items-center space-x-4">
            <Image
                src={user?.profilePic || "/profile-icon.png"}
                alt="Profile"
                width={40}
                height={40}
                className="rounded-full cursor-pointer border-2 border-gray-300 p-1"
            />
            <button
                className="text-white text-lg font-semibold px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 transition"
                onClick={() => {
                  localStorage.removeItem("isLoggedIn");
                  localStorage.removeItem("user");
                  setUser(null);
                  router.push("/auth");
                }}
            >
              Sign Out
            </button>
          </div>
        </nav>

        {/* Profile Card */}
        <div className="bg-white p-8 shadow-xl rounded-lg w-full max-w-md flex flex-col items-center text-black mt-24">
          {/* Profile Picture */}
          <div className="relative w-24 h-24">
            <Image
                src={user?.profilePic || "/profile-icon.png"}
                alt="Profile"
                width={100}
                height={100}
                className="rounded-full border-4 border-[#00BCD4] shadow-md"
            />
          </div>

          {/* Welcome Message */}
          <h2 className="text-2xl font-bold text-[#00BCD4] mt-4 uppercase">
            Welcome, {user?.firstName} {user?.lastName}!
          </h2>

          {/* User Info */}
          <div className="text-gray-700 text-lg w-full text-left space-y-3 mt-6 border-t border-gray-300 pt-4">
            <p>
              <strong className="text-[#00BCD4]">First Name:</strong>{" "}
              {user?.firstName}
            </p>
            <p>
              <strong className="text-[#00BCD4]">Last Name:</strong>{" "}
              {user?.lastName}
            </p>
            <p>
              <strong className="text-[#00BCD4]">Email:</strong> {user?.email}
            </p>
            <p>
              <strong className="text-[#00BCD4]">Gender:</strong>{" "}
              {user?.gender || "Not Set"}
            </p>
            <p>
              <strong className="text-[#00BCD4]">Date of Birth:</strong>{" "}
              {user?.dob || "Not Set"}
            </p>
          </div>
        </div>
      </div>
  );
}
