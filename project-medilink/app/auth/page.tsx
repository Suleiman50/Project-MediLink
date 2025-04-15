"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [userType, setUserType] = useState("Patient");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    gender: "",
    dob: "",
  });


  // Add class to body to remove background
  useEffect(() => {
    // Add class to remove s.jpg background
    document.body.classList.add("authpage");
    
    // Create and load the script
    const script = document.createElement("script");
    script.src = "/finisher-header.es7.min.js";
    script.async = true;

    interface FinisherHeaderOptions {
      count: number;
      size: {
        min: number;
        max: number;
        pulse: number;
      };
      speed: {
        x: {
          min: number;
          max: number;
        };
        y: {
          min: number;
          max: number;
        };
      };
      colors: {
        background: string;
        particles: string[];
      };
      blending: string;
      opacity: {
        center: number;
        edge: number;
      };
      skew: number;
      shapes: string[];
    }

    interface Window {
      FinisherHeader: new (options: FinisherHeaderOptions) => void;
    }

    script.onload = () => {
      if (typeof window !== 'undefined' && (window as unknown as Window).FinisherHeader) {
        new (window as unknown as Window).FinisherHeader({
          count: 4,
          size: {
            min: 1200,
            max: 1500,
            pulse: 0.1
          },
          speed: {
            x: {
              min: 0,
              max: 0.2
            },
            y: {
              min: 0,
              max: 0.2
            }
          },
          colors: {
            background: "#00bcd4",
            particles: [
              "#00bcd4",
              "#0c9cff",
              "#15a0de"
            ]
          },
          blending: "lighten",
          opacity: {
            center: 0.8,
            edge: 0.2
          },
          skew: 0,
          shapes: [
            "t"
          ]
        });
        
        // Add loaded class to finisher-header
        const finisherHeader = document.querySelector('.finisher-header');
        if (finisherHeader) {
          finisherHeader.classList.add('loaded');
        }
      }
    };

    document.body.appendChild(script);

    return () => {
      document.body.classList.remove("authpage");
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  const [errorMessage, setErrorMessage] = useState(""); // NEW: store error message
  const router = useRouter();
  const [passwordStrength, setPasswordStrength] = useState("");
  const [passwordHint, setPasswordHint] = useState("");

  const evaluatePasswordStrength = (password: string) => {
    let strength = "";
    let hint = "";

    if (password.length < 6) {
      strength = "Weak";
      hint = "Use at least 6 characters.";
    } else if (
      !/[A-Z]/.test(password) ||
      !/[0-9]/.test(password) ||
      !/[!@#$%^&*]/.test(password)
    ) {
      strength = "Medium";
      hint = "Add an uppercase letter, number, and symbol (!@#$%^&*).";
    } else {
      strength = "Strong";
      hint = "Great! Your password is strong.";
    }

    setPasswordStrength(strength);
    setPasswordHint(hint);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (!isLogin && name === "password") {
      evaluatePasswordStrength(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(""); // Clear any previous error

    if (isLogin) {
      // Sign-in flow
      try {
        const response = await fetch("/api/auth/signin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            userType,
          }),
        });

        const result = await response.json();
        if (response.ok) {
          // success
          console.log("✅ Login successful. Storing token and user:", result);
          localStorage.setItem("token", result.token);
          localStorage.setItem("user", JSON.stringify(result.user));
          router.push("/profile");
        } else {
          // display error inline
          setErrorMessage(result.error || "An error occurred during sign in.");
        }
      } catch (error) {
        console.error("Sign in error:", error);
        setErrorMessage("An error occurred during sign in. Please try again later.");
      }
    } else {
      // Sign-up flow
      if (formData.password !== formData.confirmPassword) {
        setErrorMessage("Passwords do not match!");
        return;
      }

      const endpoint = userType === "Patient" ? "/api/patients" : "/api/doctors";
      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...formData, userType }),
        });
        const result = await response.json();

        if (response.ok) {
          router.push("/auth/verify-message");
        } else {
          setErrorMessage(result.error || "An error occurred during sign up.");
        }
      } catch (error) {
        console.error("Sign up error:", error);
        setErrorMessage("An error occurred during sign up. Please try again later.");
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      {/* Finisher Header Background */}
      <div className="finisher-header absolute inset-0 z-0"></div>
      
      <div className="bg-white p-8 shadow-lg rounded-lg w-full max-w-md flex flex-col items-center z-10">
        {/* Toggle Switch */}
        <div className="flex justify-between mb-6 w-full bg-gray-200 rounded-full p-1 relative">
          <div
            className={`absolute top-0 left-0 h-full w-1/2 bg-[#00BCD4] rounded-full transition-all duration-300 ${
              !isLogin ? "translate-x-full" : ""
            }`}
          ></div>
          <button
            className={`w-1/2 py-3 rounded-full z-10 text-sm font-semibold transition-all ${
              isLogin ? "text-white" : "text-gray-500"
            }`}
            onClick={() => setIsLogin(true)}
          >
            Sign In
          </button>
          <button
            className={`w-1/2 py-3 rounded-full z-10 text-sm font-semibold transition-all ${
              !isLogin ? "text-white" : "text-gray-500"
            }`}
            onClick={() => setIsLogin(false)}
          >
            Sign Up
          </button>
        </div>

        <h2 className="text-lg font-bold text-[#00BCD4] mb-4">
          {isLogin ? "Sign In to Your Account" : "Create an Account"}
        </h2>

        {errorMessage && (
  <div className="relative mx-auto mt-1 w-80 max-w-md rounded-md bg-gradient-to-r from-[#00BCD4] to-[#008F9F] text-white border border-[#0] p-2 shadow-md flex items-center justify-center">
    <span className="text-sm font-medium tracking-wide">{errorMessage}</span>
    {/* Fading ECG Line */}
    <svg
      className="w-12 h-6 text-white ml-2 animate-ecg"
      viewBox="0 0 100 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polyline
        points="0,10 20,10 30,5 40,15 50,5 60,10 80,10 100,10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </div>
)}


        <form className="space-y-4 w-full" onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              {/* User Type Selection */}
              <div className="flex justify-between w-full bg-gray-100 rounded-lg p-1 mb-3">
                <button
                  type="button"
                  className={`w-1/2 py-2 rounded-lg text-sm font-semibold ${
                    userType === "Patient" ? "bg-[#00BCD4] text-white" : "text-gray-600"
                  }`}
                  onClick={() => setUserType("Patient")}
                >
                  Patient
                </button>

                <button
                  type="button"
                  className={`w-1/2 py-2 rounded-lg text-sm font-semibold ${
                    userType === "Physician" ? "bg-[#00BCD4] text-white" : "text-gray-600"
                  }`}
                  onClick={() => setUserType("Physician")}
                >
                  Doctor
                </button>
              </div>

              {/* First & Last Name */}
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  name="firstName"
                  placeholder="First Name"
                  className="w-full p-2 border rounded-lg text-sm"
                  onChange={handleChange}
                  required
                />
                <input
                  type="text"
                  name="lastName"
                  placeholder="Last Name"
                  className="w-full p-2 border rounded-lg text-sm"
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Gender & Date of Birth */}
              <div className="grid grid-cols-2 gap-3">
                <select name="gender" className="w-full p-2 border rounded-lg text-sm" onChange={handleChange} required>
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
                <input
                  type="date"
                  name="dob"
                  className="w-full p-2 border rounded-lg text-sm"
                  onChange={handleChange}
                  required
                />
              </div>
            </>
          )}

          {/* Email & Password */}
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            className="w-full p-2 border rounded-lg text-sm"
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            className="w-full p-2 border rounded-lg text-sm"
            onChange={handleChange}
            required
          />

          {/* Password Strength Indicator - Only in Sign-Up */}
          {!isLogin && formData.password && (
            <div className="mt-1">
              <div
                className={`text-sm font-semibold ${
                  passwordStrength === "Weak"
                    ? "text-red-500"
                    : passwordStrength === "Medium"
                    ? "text-yellow-500"
                    : "text-green-500"
                }`}
              >
                {passwordStrength} {passwordHint && `- ${passwordHint}`}
              </div>

              {/* Strength Meter */}
              <div className="h-1 w-full bg-gray-300 mt-1 rounded">
                <div
                  className={`h-1 rounded transition-all duration-300 ${
                    passwordStrength === "Strong"
                      ? "bg-green-500 w-full"
                      : passwordStrength === "Medium"
                      ? "bg-yellow-500 w-2/3"
                      : passwordStrength === "Weak"
                      ? "bg-red-500 w-1/3"
                      : "bg-gray-300 w-0"
                  }`}
                ></div>
              </div>
            </div>
          )}

          {!isLogin && (
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              className="w-full p-2 border rounded-lg text-sm"
              onChange={handleChange}
              required
            />
          )}

          <button className="w-full bg-[#00BCD4] text-white py-3 rounded-lg text-sm font-semibold">
            {isLogin ? "Sign In" : "Sign Up"}
          </button>
        </form>

        {/* Forgot Password */}
        {isLogin && (
          <Link href="/auth/forgot-password" className="text-[#00BCD4] text-xs mt-2">
            Forgot password?
          </Link>
        )}
      </div>
    </div>
  );
}