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
    const token = localStorage.getItem("token");
    if (!token) {
      console.log("🔴 No token found. Redirecting to sign in.");
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
          setUser({
            firstName: data.user.firstName || "",
            lastName: data.user.lastName || "",
            email: data.user.email || "",
            gender: data.user.gender || "",
            dob: data.user.dob || "",
            userType: data.user.userType || "",
            height: data.user.height ?? "",
            weight: data.user.weight ?? "",
            bloodType: data.user.bloodType ?? "",
            allergies: data.user.allergies ?? "",
            specialty: data.user.specialty ?? "",
            clinic_location: data.user.clinic_location ?? "",
            phone_number: data.user.phone_number ?? "",
          });
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
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      const data = await res.json();
      if (res.ok) {
        setUpdateMessage("Profile updated successfully!");
        setIsEditing(false);
        setTimeout(() => {
          setUpdateMessage(null);
        }, 3000);
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch {
      setErrorMessage("Network error. Please Try again.");
      setTimeout(() => {
        setUpdateMessage(null);
      }, 3000);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem("token");
    router.push("/auth");
  };

  if (loading) {
    return <div className="min-h-screen flex justify-center items-center bg-[#00BCD4] text-white text-lg">Loading...</div>;
  }

  return (
    <div className="h-full w-full flex flex-col items-center bg-cover bg-center px-4 relative backdrop-blur-xl bg-white/30" style={{ backgroundImage: "url('/s.jpg')" }}>
      <div className="p-14 w-full max-w-5xl flex items-start space-x-14 mt-10 bg-white/20 backdrop-blur-lg rounded-[32px] shadow-xl border border-white/20">
        <div className="flex flex-col items-center">
          <div className="relative w-48 h-48">
            <Image src={user?.profilePic || "/profile-icon.png"} alt="Profile" width={192} height={192} className="rounded-full border-4 border-white shadow-lg" />
          </div>
        </div>
        <div className="w-full">
          <h2 className="text-4xl font-bold text-white mb-8 border-b border-white pb-3 text-center">Personal Information</h2>
          <div className="grid grid-cols-2 gap-10">
            {[
              { label: "First Name", name: "firstName", disabled: true },
              { label: "Last Name", name: "lastName", disabled: true },
              { label: "Email", name: "email", disabled: true },
              { label: "Gender", name: "gender", disabled: true },
              { label: "Date of Birth", name: "dob", disabled: true },
              { label: "Age", name: "age", value: user?.dob ? calculateAge(user.dob).toString() : "Not Set", disabled: true },
            ].map(({ label, name, value, disabled }) => (
              <div key={name}>
                <label className="text-white font-semibold text-lg">{label}</label>
                <input type="text" name={name} value={value ?? user?.[name as keyof typeof user] ?? ""} disabled={disabled} className="border p-4 rounded-xl w-full bg-white/40 text-black" />
              </div>
            ))}

            {user?.userType === "Patient" && (
              <>

                <div>
                  <label className="text-white font-semibold text-lg">Height (CM)</label>
                  <input type="text" name="height" value={user?.height ?? ""} onChange={handleChange} disabled={!isEditing} className="border p-4 rounded-xl w-full bg-white/40 text-black" />
                </div>
                <div>
                  <label className="text-white font-semibold text-lg">Weight (KG)</label>
                  <input type="text" name="weight" value={user?.weight ?? ""} onChange={handleChange} disabled={!isEditing} className="border p-4 rounded-xl w-full bg-white/40 text-black" />
                </div>
                <div>
                  <label className="text-white font-semibold text-lg">Allergies</label>
                  <input type="text" name="allergies" value={user?.allergies ?? ""} onChange={handleChange} disabled={!isEditing} className="border p-4 rounded-xl w-full bg-white/40 text-black" />
                </div>
                <div>
                  <label className="text-white font-semibold text-lg">Blood Type</label>
                  <input type="text" name="bloodType" value={user?.bloodType ?? ""} onChange={handleChange} disabled={!isEditing} className="border p-4 rounded-xl w-full bg-white/40 text-black" />
                </div>
              </>
            )}

            {user?.userType === "Doctor" && (
              <>
                <div>
                  <label className="text-white font-semibold text-lg">Specialty</label>
                  <input type="text" name="specialty" value={user?.specialty ?? ""} onChange={handleChange} disabled={!isEditing} className="border p-4 rounded-xl w-full bg-white/40 text-black" />
                </div>
                <div>
                  <label className="text-white font-semibold text-lg">Clinic Location</label>
                  <input type="text" name="clinic_location" value={user?.clinic_location ?? ""} onChange={handleChange} disabled={!isEditing} className="border p-4 rounded-xl w-full bg-white/40 text-black" />
                </div>
                <div>
                  <label className="text-white font-semibold text-lg">Phone Number</label>
                  <input
                    type="text"
                    name="phone_number"
                    value={user?.phone_number ?? ""}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                    className="border p-4 rounded-xl w-full bg-white/40 text-black"
                    disabled={!isEditing}
                  />
                </div>
              </>
            )}
          </div>
          {updateMessage && (
              <div className="mt-4 px-4 py-2 bg-green-100 text-green-800 rounded">
                {updateMessage}
              </div>
          )}

          {errorMessage && (
              <div className="mt-4 px-4 py-2 bg-green-100 text-red-800 rounded">
                {errorMessage}
              </div>
          )}
          <div className="mt-10 flex justify-center space-x-8">
            <button className="px-8 py-4 bg-blue-500 text-white rounded-xl text-lg font-semibold" onClick={() => setIsEditing(!isEditing)}>
              {isEditing ? "Cancel" : "Edit Profile"}
            </button>
            {isEditing && (
              <button className="px-8 py-4 bg-green-500 text-white rounded-xl text-lg font-semibold" onClick={handleSave}>
                Save Changes
              </button>
            )}
            <button className="px-8 py-4 bg-red-500 text-white rounded-xl text-lg font-semibold hover:bg-red-600 transition" onClick={handleSignOut}>
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}