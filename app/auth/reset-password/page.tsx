"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState("");
  const [passwordHint, setPasswordHint] = useState("");

  useEffect(() => {
    if (!token) {
      setMessage("Invalid or expired token.");
    }
  }, [token]);

  // ✅ Function to Evaluate Password Strength
  const evaluatePasswordStrength = (password: string) => {
    let strength = "";
    let hint = "";

    if (password.length < 6) {
      strength = "Weak";
      hint = "Use at least 6 characters.";
    } else if (!/[A-Z]/.test(password) || !/[0-9]/.test(password) || !/[!@#$%^&*]/.test(password)) {
      strength = "Medium";
      hint = "Add an uppercase letter, number, and symbol (!@#$%^&*).";
    } else {
      strength = "Strong";
      hint = "Great! Your password is strong.";
    }

    setPasswordStrength(strength);
    setPasswordHint(hint);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    evaluatePasswordStrength(e.target.value);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (password !== confirmPassword) {
      setMessage("Passwords do not match!");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage("Password reset successful! Redirecting to login...");
        setTimeout(() => router.push("/auth"), 3000);
      } else {
        setMessage(data.error || "An error occurred.");
      }
    } catch (error) {
      setMessage("Server error. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Reset Password</h2>

        {message && <p className="text-red-500">{message}</p>}

        <form onSubmit={handleResetPassword} className="space-y-4">
          <input
            type="password"
            placeholder="New Password"
            className="w-full p-2 border rounded-lg"
            value={password}
            onChange={handlePasswordChange}
            required
          />
          
          {/* ✅ Password Strength Indicator */}
          <div className="mt-1 h-[24px] flex items-center">
          {password && (
            <div className="mt-1">
              <div className={`text-sm font-semibold ${passwordStrength === "Weak" ? "text-red-500" : passwordStrength === "Medium" ? "text-yellow-500" : "text-green-500"}`}>
                {passwordStrength} {passwordHint && `- ${passwordHint}`}
              </div>
              

              {/* ✅ Strength Meter Bar */}
              <div className="h-1 w-full bg-gray-300 mt-1 rounded relative overflow-hidden">
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
          </div>

          <input
            type="password"
            placeholder="Confirm New Password"
            className="w-full p-2 border rounded-lg"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-lg"
            disabled={loading}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
