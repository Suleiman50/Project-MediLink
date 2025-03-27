"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";

export default function RealChatPage() {
  const [messages, setMessages] = useState<{ sender: "ai" | "user"; text: string }[]>([]);
  const [input, setInput] = useState("");

  // Add class to body to remove background
  useEffect(() => {
    document.body.classList.add("realchatpage");
    return () => {
      document.body.classList.remove("realchatpage");
    };
  }, []);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMessage = input;
    setInput("");
    setMessages((prev) => [...prev, { sender: "user", text: userMessage }]);
    
    // Simulate AI response (replace with real AI call)
    setTimeout(() => {
      setMessages((prev) => [...prev, { 
        sender: "ai", 
        text: `I'll help you find the right medical assistance. Can you tell me more about your symptoms?` 
      }]);
    }, 1000);
  };

  // Suggestion box data
  const suggestions = [
    {
      text: "Find the nearest available doctor for my symptoms"
    },
    {
      text: "Get emergency medical advice for current condition"
    },
    {
      text: "Schedule a follow-up appointment with my doctor"
    },
    {
      text: "Learn about preventive care and health tips"
    }
  ];

  return (
    <div className="min-h-screen absolute inset-0 bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50">
      <main className="max-w-4xl mx-auto px-4 py-24 relative">
        {/* Welcome Message */}
        {messages.length === 0 && (
          <div className="text-center mb-16">
            <h1 className="text-5xl font-semibold mb-3 text-gray-800">
              How can I help you today?
            </h1>
          </div>
        )}

        {/* Suggestion Boxes */}
        {messages.length === 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => {
                  setInput(suggestion.text);
                  handleSend();
                }}
                className="p-6 bg-white rounded-[30px] text-left group relative hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-[#00BCD4]/20 hover:bg-gray-50"
              >
                <span className="text-lg text-gray-700 font-medium block">{suggestion.text}</span>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg className="w-6 h-6 text-[#00BCD4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Chat Messages */}
        <div ref={chatContainerRef} className="space-y-6 mb-24">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] p-4 rounded-[20px] shadow-sm ${
                  msg.sender === "user"
                    ? "bg-[#00BCD4] text-white font-medium"
                    : "bg-white text-gray-800 border border-gray-100"
                }`}
              >
                <p className="whitespace-pre-line">{msg.text}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Input Bar */}
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
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
              />
              <button
                onClick={handleSend}
                className="p-2 text-white bg-[#00BCD4] rounded-full hover:bg-[#00BCD4]/90 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
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
