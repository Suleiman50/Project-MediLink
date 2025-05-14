"use client";

import { useEffect, useState } from "react";

/* helper: convert YYYY-MM-DD → DD/MM/YYYY */
const convertToDDMMYYYY = (dateStr: string): string => {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "not specified";
  const d = date.getDate().toString().padStart(2, "0");
  const m = (date.getMonth() + 1).toString().padStart(2, "0");
  const y = date.getFullYear().toString();
  return `${d}/${m}/${y}`;
};

export default function RealChatPage() {
  const [messages, setMessages] = useState<{ sender: "ai" | "user"; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [user, setUser] = useState<any>(null);

  /* load user from localStorage */
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  /* body class */
  useEffect(() => {
    document.body.classList.add("realchatpage");
    return () => document.body.classList.remove("realchatpage");
  }, []);

  /* scroll on new messages */
  useEffect(() => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  }, [messages]);

  /* delay helper */
  const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

  /* scroll helper */
  const autoScroll = () =>
      window.scrollTo({ top: document.body.scrollHeight + 100, behavior: "smooth" });

  /* ------------------------------ SEND ------------------------------ */
  const handleSend = async () => {
    if (!input.trim()) return;

    const newUserMsg = { sender: "user" as const, text: input };
    const aiPlaceholder = { sender: "ai" as const, text: "" };
    const newMsgs = [...messages, newUserMsg, aiPlaceholder];
    setMessages(newMsgs);
    setInput("");

    const convoForServer = newMsgs.map((m) => ({
      role: m.sender === "user" ? "user" : "assistant",
      content: m.text,
    }));

    const userType = user?.userType || "Patient";

    /* Patient medical profile (UNCHANGED) */
    const medicalProfile =
        userType.toLowerCase() === "patient"
            ? {
              weight: user.weight ? user.weight.toString() : "not specified",
              height: user.height ? user.height.toString() : "not specified",
              dob: user.dob ? convertToDDMMYYYY(user.dob) : "not specified",
              gender: user.gender || "not specified",
              bloodType: user.bloodType || "not specified",
              allergies: user.allergies || "not specified",
            }
            : {};

    /* Doctor profile (NEW) */
    // ▼ replace this block ONLY
    const doctorProfile =
        userType.toLowerCase() === "doctor"
            ? {
              // accept both shapes (firstName / first_name)
              first_name: user.first_name ?? user.firstName ?? "not specified",
              last_name:  user.last_name  ?? user.lastName  ?? "not specified",
              specialty:  user.specialty  ?? "not specified",
            }
            : {};

    try {
      const res = await fetch("/api/chatgpt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userType,
          medicalProfile,
          doctorProfile, // <- sent only for doctors
          messages: convoForServer,
        }),
      });

      if (!res.ok) throw new Error("API request failed");
      const data = await res.json();
      const full = data.text as string;

      let cur = "";
      for (let i = 0; i < full.length; i++) {
        cur += full[i];
        setMessages((prev) => {
          const up = [...prev];
          up[up.length - 1] = { sender: "ai", text: cur };
          return up;
        });
        autoScroll();
        await delay(20);
      }
    } catch (err) {
      console.error("AI error:", err);
      setMessages((prev) => {
        const up = [...prev];
        up[up.length - 1] = {
          sender: "ai",
          text: "Sorry, there was an error retrieving the response.",
        };
        return up;
      });
    }
  };

  /* --- suggestion buttons (unchanged) --- */
  const suggestions = [
    { text: "Find the nearest available doctor for my symptoms" },
    { text: "Get emergency medical advice for current condition" },
    { text: "Schedule a follow-up appointment with my doctor" },
    { text: "Learn about preventive care and health tips" },
  ];

  return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50">
        <main className="max-w-4xl mx-auto px-4 py-24 relative">

          {/* welcome */}
          {messages.length === 0 && (
              <div className="text-center mb-16">
                <h1 className="text-5xl font-semibold mb-3 text-gray-800">
                  How can I help you today?
                </h1>
              </div>
          )}

          {/* suggestions */}
          {messages.length === 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                {suggestions.map((s, i) => (
                    <button
                        key={i}
                        onClick={() => {
                          setInput(s.text);
                          handleSend();
                        }}
                        className="p-6 bg-white rounded-[30px] text-left group relative hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-[#00BCD4]/20 hover:bg-gray-50"
                    >
                      <span className="text-lg text-gray-700 font-medium block">{s.text}</span>
                      <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg className="w-6 h-6 text-[#00BCD4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </button>
                ))}
              </div>
          )}

          {/* messages */}
          <div className="space-y-6 mb-32">
            {messages.map((m, i) => (
                <div key={i} className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                      className={`max-w-[80%] p-4 rounded-[20px] shadow-sm ${
                          m.sender === "user"
                              ? "bg-[#00BCD4] text-white font-medium"
                              : "bg-white text-gray-800 border border-gray-100"
                      }`}
                  >
                    <p className="whitespace-pre-line">{m.text}</p>
                  </div>
                </div>
            ))}
          </div>

          {/* input bar */}
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-[20px] border border-gray-100">
                <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </button>
                <input
                    type="text"
                    className="flex-1 bg-transparent p-2 focus:outline-none text-gray-800 placeholder-gray-400"
                    placeholder="Ask MedAI about your health concerns..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                />
                <button
                    onClick={handleSend}
                    className="p-2 text-white bg-[#00BCD4] rounded-full hover:bg-[#00BCD4]/90 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7-7 7m7-7H3" />
                  </svg>
                </button>
              </div>
              <p className="text-gray-500 text-sm mt-2 text-center">
                Your conversations are private and processed securely by MedAI.
                Don't share sensitive personal information.
              </p>
            </div>
          </div>
        </main>
      </div>
  );
}