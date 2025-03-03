"use client";

import { useState } from "react";
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

  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  
    if (isLogin) {
      // Sign-in flow
      try {
        const response = await fetch("/api/auth/signin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          // We only need email, password, and userType for sign in
          body: JSON.stringify({ 
            email: formData.email, 
            password: formData.password, 
            userType 
          }),
        });
  
        const result = await response.json();
        if (response.ok) {
          alert(result.message);
          // Save the JWT token in localStorage (or set a cookie)
          localStorage.setItem("token", result.token);
          // Redirect to a protected page, for example, profile page
          router.push("/profile");
        } else {
          alert(result.error);
        }
      } catch (error) {
        console.error("Sign in error:", error);
        alert("An error occurred during sign in. Please try again later.");
      }
    } else {
      // Sign-up flow (handled by your existing code)
      if (formData.password !== formData.confirmPassword) {
        alert("Passwords do not match!");
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
          alert(result.message);
          router.push("/auth/verify-message");
        } else {
          alert(result.error);
        }
      } catch (error) {
        console.error("Sign up error:", error);
        alert("An error occurred during sign up. Please try again later.");
      }
    }
  };
  
  



  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: "url('/s.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        width: "100vw",
        height: "100vh",
      }}
    >
      {/* Form Container */}
      <div className="bg-white p-8 shadow-lg rounded-lg w-full max-w-md flex flex-col items-center">

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

        <h2 className="text-lg font-bold text-[#00BCD4] mb-4">{isLogin ? "Sign In to Your Account" : "Create an Account"}</h2>

        {/* Form */}
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
                <input type="text" name="firstName" placeholder="First Name" className="w-full p-2 border rounded-lg text-sm" onChange={handleChange} required />
                <input type="text" name="lastName" placeholder="Last Name" className="w-full p-2 border rounded-lg text-sm" onChange={handleChange} required />
              </div>

              {/* Gender & Date of Birth */}
              <div className="grid grid-cols-2 gap-3">
                <select name="gender" className="w-full p-2 border rounded-lg text-sm" onChange={handleChange} required>
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
                <input type="date" name="dob" className="w-full p-2 border rounded-lg text-sm" onChange={handleChange} required />
              </div>
            </>
          )}

          {/* Email & Password */}
          <input type="email" name="email" placeholder="Email Address" className="w-full p-2 border rounded-lg text-sm" onChange={handleChange} required />
          <input type="password" name="password" placeholder="Password" className="w-full p-2 border rounded-lg text-sm" onChange={handleChange} required />
          
          {!isLogin && (
            <input type="password" name="confirmPassword" placeholder="Confirm Password" className="w-full p-2 border rounded-lg text-sm" onChange={handleChange} required />
          )}

          {/* Submit Button */}
          <button className="w-full bg-[#00BCD4] text-white py-3 rounded-lg text-sm font-semibold">{isLogin ? "Sign In" : "Sign Up"}</button>
        </form>

        {/* Forgot Password */}
        {isLogin && (
          <Link href="#" className="text-[#00BCD4] text-xs mt-2">Forgot password?</Link>
        )}
      </div>
    </div>
  );
}
