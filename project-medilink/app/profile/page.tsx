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
    gender: string;
    dob: string;
    userType?: string;
    height?: string;
    weight?: string;
    allergies?: string;
    bloodType?: string;
    specialty?: string;
    clinic_location?: string;
    phone_number?: string;
    profilePic?: string | null;
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [updateMessage, setUpdateMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    document.body.classList.add("profilepage");
    const header = document.createElement("div");
    header.className = "finisher-header";
    header.style.width = "100%";
    header.style.height = "100vh";
    document.body.appendChild(header);

    const script = document.createElement("script");
    script.src = "/finisher-header.es8.min.js";
    script.async = true;

    script.onload = () => {
      if (window.FinisherHeader) {
        new window.FinisherHeader({
          count: 12,
          size: { min: 1300, max: 1500, pulse: 0 },
          speed: { x: { min: 1.2, max: 3 }, y: { min: 0.6, max: 3 } },
          colors: { background: "#00bcd4", particles: ["#1a5b9e", "#63cdf6"] },
          blending: "lighten",
          opacity: { center: 0.6, edge: 0 },
          skew: 0,
          shapes: ["c"],
          className: "finisher-header",
        });
      }
    };
    document.body.appendChild(script);

    return () => {
      if (script.parentNode) script.parentNode.removeChild(script);
      if (header.parentNode) header.parentNode.removeChild(header);
      document.body.classList.remove("profilepage");
    };
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/auth");
      return;
    }

    fetch("/api/auth/verify-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.valid) {
          const u = data.user;
          const initialUser = {
            firstName: u.firstName || "",
            lastName: u.lastName || "",
            email: u.email || "",
            gender: u.gender || "",
            dob: u.dob || "",
            userType: u.userType || "",
            height: u.height?.toString() ?? "",
            weight: u.weight?.toString() ?? "",
            bloodType: u.bloodType ?? "",
            allergies: u.allergies ?? "",
            specialty: u.specialty ?? "",
            clinic_location: u.clinic_location ?? "",
            phone_number: u.phone_number ?? "",
          };
          setUser(initialUser);
          localStorage.setItem("user", JSON.stringify(initialUser));
        } else {
          localStorage.removeItem("token");
          router.push("/auth");
        }
      })
      .catch(() => {
        localStorage.removeItem("token");
        router.push("/auth");
      });

    setTimeout(() => setLoading(false), 500);
  }, [router]);

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    if (!user) return;
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!user) return;
    const token = localStorage.getItem("token");
    if (!token) return;

    const updateData = {
      height: user.height,
      weight: user.weight,
      allergies: user.allergies,
      bloodType: user.bloodType,
      specialty: user.specialty,
      clinic_location: user.clinic_location,
      phone_number: user.phone_number,
    };

    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });
      const data = await res.json();
      if (res.ok) {
        const u = data.user;
        const newUser = {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          gender: user.gender,
          dob: user.dob,
          userType: user.userType,
          height: u.height?.toString() ?? "",
          weight: u.weight?.toString() ?? "",
          bloodType: u.bloodType ?? "",
          allergies: u.allergies ?? "",
          specialty: u.specialty ?? "",
          clinic_location: u.clinic_location ?? "",
          phone_number: u.phone_number ?? "",
        };
        setUser(newUser);
        localStorage.setItem("user", JSON.stringify(newUser));
        setUpdateMessage("Profile updated successfully!");
        setIsEditing(false);
        setTimeout(() => setUpdateMessage(null), 3000);
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch {
      setErrorMessage("Network error. Please Try again.");
      setTimeout(() => setErrorMessage(null), 3000);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem("token");
    router.push("/auth");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-[#00BCD4] text-white text-lg">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center px-4 relative backdrop-blur-xl bg-white/30">
      <div className="p-4 md:p-14 w-full max-w-5xl flex flex-col md:flex-row items-start md:space-x-14 mt-4 md:mt-10 bg-white/20 backdrop-blur-lg rounded-[32px] shadow-xl border border-white/20">
        {/* Profile Image Section */}
        <div className="flex flex-col items-center w-full md:w-auto mb-8 md:mb-0">
          <div className="relative w-32 h-32 md:w-48 md:h-48">
            <Image
              src={user?.profilePic || "/profile-icon.png"}
              alt="Profile"
              width={192}
              height={192}
              className="rounded-full border-4 border-white shadow-lg w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Profile Information Section */}
        <div className="w-full">
          <h2 className="text-2xl md:text-4xl font-bold text-white mb-4 md:mb-8 border-b border-white pb-2 md:pb-3 text-center">
            Personal Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-10">
            {/* Common Fields */}
            {[
              { label: "First Name", name: "firstName", disabled: true },
              { label: "Last Name", name: "lastName", disabled: true },
              { label: "Email", name: "email", disabled: true },
              { label: "Gender", name: "gender", disabled: true },
              { label: "Date of Birth", name: "dob", disabled: true },
              {
                label: "Age",
                name: "age",
                value: user?.dob
                  ? calculateAge(user.dob).toString()
                  : "Not Set",
                disabled: true,
              },
            ].map(({ label, name, value, disabled }) => (
              <div key={name} className="mb-2 md:mb-0">
                <label className="text-white font-semibold text-sm md:text-lg">
                  {label}
                </label>
                <input
                  type="text"
                  name={name}
                  value={value ?? user?.[name as keyof typeof user] ?? ""}
                  disabled={disabled}
                  className="border p-2 md:p-4 rounded-xl w-full bg-white/40 text-black text-sm md:text-base"
                />
              </div>
            ))}

            {/* Patient Specific Fields */}
            {user?.userType === "Patient" && (
              <>
                <div className="mb-2 md:mb-0">
                  <label className="text-white font-semibold text-sm md:text-lg">
                    Height (CM)
                  </label>
                  <input
                    type="text"
                    name="height"
                    value={user?.height ?? ""}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="border p-2 md:p-4 rounded-xl w-full bg-white/40 text-black text-sm md:text-base"
                  />
                </div>
                <div className="mb-2 md:mb-0">
                  <label className="text-white font-semibold text-sm md:text-lg">
                    Weight (KG)
                  </label>
                  <input
                    type="text"
                    name="weight"
                    value={user?.weight ?? ""}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="border p-2 md:p-4 rounded-xl w-full bg-white/40 text-black text-sm md:text-base"
                  />
                </div>
                <div className="mb-2 md:mb-0">
                  <label className="text-white font-semibold text-sm md:text-lg">
                    Allergies
                  </label>
                  <input
                    type="text"
                    name="allergies"
                    value={user?.allergies ?? ""}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="border p-2 md:p-4 rounded-xl w-full bg-white/40 text-black text-sm md:text-base"
                  />
                </div>
                <div className="mb-2 md:mb-0">
                  <label className="text-white font-semibold text-sm md:text-lg">
                    Blood Type
                  </label>
                  <input
                    type="text"
                    name="bloodType"
                    value={user?.bloodType ?? ""}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="border p-2 md:p-4 rounded-xl w-full bg-white/40 text-black text-sm md:text-base"
                  />
                </div>
              </>
            )}

            {/* Doctor Specific Fields */}
            {user?.userType === "Doctor" && (
              <>
                <div className="mb-2 md:mb-0">
                  <label className="text-white font-semibold text-sm md:text-lg">
                    Specialty
                  </label>
                  <input
                    type="text"
                    name="specialty"
                    value={user?.specialty ?? ""}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="border p-2 md:p-4 rounded-xl w-full bg-white/40 text-black text-sm md:text-base"
                  />
                </div>
                <div className="mb-2 md:mb-0">
                  <label className="text-white font-semibold text-sm md:text-lg">
                    Clinic Location
                  </label>
                  <input
                    type="text"
                    name="clinic_location"
                    value={user?.clinic_location ?? ""}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="border p-2 md:p-4 rounded-xl w-full bg-white/40 text-black text-sm md:text-base"
                  />
                </div>
                <div className="mb-2 md:mb-0">
                  <label className="text-white font-semibold text-sm md:text-lg">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    name="phone_number"
                    value={user?.phone_number ?? ""}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="border p-2 md:p-4 rounded-xl w-full bg-white/40 text-black text-sm md:text-base"
                  />
                </div>
              </>
            )}
          </div>

          {/* Status Messages */}
          <div className="mt-4 md:mt-10">
            {updateMessage && (
              <div className="px-2 py-1 md:px-4 md:py-2 bg-green-100 text-green-800 rounded text-sm md:text-base">
                {updateMessage}
              </div>
            )}
            {errorMessage && (
              <div className="px-2 py-1 md:px-4 md:py-2 bg-red-100 text-red-800 rounded text-sm md:text-base">
                {errorMessage}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-6 md:mt-10 flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-8">
            <button
              className="px-4 py-2 md:px-8 md:py-4 bg-blue-500 text-white rounded-xl text-sm md:text-lg font-semibold hover:bg-blue-600 transition"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? "Cancel" : "Edit Profile"}
            </button>
            {isEditing && (
              <button
                className="px-4 py-2 md:px-8 md:py-4 bg-green-500 text-white rounded-xl text-sm md:text-lg font-semibold hover:bg-green-600 transition"
                onClick={handleSave}
              >
                Save Changes
              </button>
            )}
            <button
              className="px-4 py-2 md:px-8 md:py-4 bg-red-500 text-white rounded-xl text-sm md:text-lg font-semibold hover:bg-red-600 transition"
              onClick={handleSignOut}
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
