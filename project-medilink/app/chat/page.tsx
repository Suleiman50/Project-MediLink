"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation"; // 1) import useRouter
import Image from "next/image";
import Script from "next/script";

export default function ChatPage() {
  const router = useRouter(); // 2) set up router

  useEffect(() => {
    // Add class immediately
    document.body.classList.add("chatpage");
    document.body.style.backgroundColor = "#00BCD4";
    
    return () => {
      document.body.classList.remove("chatpage");
      document.body.style.backgroundColor = "";
    };
  }, []);

  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([]);
  const [isTyping, setIsTyping] = useState<{ user: boolean; ai: boolean }>({ user: false, ai: false });
  const [messageIndex, setMessageIndex] = useState(0);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Hard-coded conversation
  const conversation = [
    { sender: "user", text: "Hi, I'm feeling unwell and need some help." },
    { sender: "ai", text: "I'm here to assist you! Could you describe your symptoms?" },
    { sender: "user", text: "I have a fever and a sore throat." },
    { sender: "ai", text: "Got it. Do you have any other symptoms like headaches, body aches, or difficulty breathing?" },
    { sender: "user", text: "I also have a slight headache, but no breathing problems." },
    { sender: "ai", text: "Thank you for sharing. Based on your symptoms, I recommend consulting a general practitioner. Would you like me to find the nearest doctor for you?" },
    { sender: "user", text: "Yes, please. That would be great!" },
    { sender: "ai", text: "I found a few general practitioners nearby. I can help you book an appointment or provide their contact details. How would you like to proceed?" },
    { sender: "user", text: "Can you give me their contact details first?" },
    { sender: "ai", text: "Sure! Here are some doctors near you: [Doctor 1 - Contact], [Doctor 2 - Contact]. Let me know if you'd like to book an appointment directly!" },
    { sender: "user", text: "Thanks, that's really helpful!" },
    { sender: "ai", text: "You're welcome! If you need anything else, I'm here to help. Stay healthy!" }
  ];

  // Advance through conversation
  useEffect(() => {
    if (messageIndex < conversation.length) {
      const currentMessage = conversation[messageIndex];
      setIsTyping(currentMessage.sender === "user" ? { user: true, ai: false } : { user: false, ai: true });

      const timeoutId = setTimeout(() => {
        setMessages((prev) => {
          if (!prev.some((msg) => msg.text === currentMessage.text)) {
            return [...prev, currentMessage];
          }
          return prev;
        });

        setIsTyping({ user: false, ai: false });
        setMessageIndex((prevIndex) => prevIndex + 1);
      }, 3000);

      return () => clearTimeout(timeoutId);
    }
  }, [messageIndex]);

  // Auto-scroll to latest message
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isTyping]);

  // Initialize ES6 FinisherHeader if loaded
  useEffect(() => {
    if (typeof window !== "undefined" && window.FinisherHeader) {
      new window.FinisherHeader({
        count: 10,
        size: {
          min: 1100,
          max: 1300,
          pulse: 0
        },
        speed: {
          x: {
            min: 0.1,
            max: 1.2
          },
          y: {
            min: 0.1,
            max: 0.3
          }
        },
        colors: {
          background: "#00bcd4",
          particles: ["#007dff", "#01adfa"]
        },
        blending: "overlay",
        opacity: {
          center: 1,
          edge: 0.1
        },
        skew: 0,
        shapes: ["c"]
      });
    }
  }, []);

  return (
    <>
      {/* Load ES6 FinisherHeader script */}
      <Script src="/finisher-header.es6.min.js" strategy="afterInteractive" />

      {/* Fullscreen Finisher Header (no inline height) */}
      <header className="header finisher-header" />

      {/* Chat Container (z-10 to appear above animation) */}
      <div className="relative z-10 min-h-screen w-full flex flex-col items-center p-4 pt-24">
        <div className="w-full max-w-4xl bg-white/40 backdrop-blur-lg p-8 rounded-3xl shadow-lg border border-white/20 flex flex-col flex-grow">
          <h2 className="text-4xl font-bold text-white mb-6 text-center">Chat with MedAI</h2>

          {/* Messages Area */}
          <div
            ref={chatContainerRef}
            className="flex flex-col space-y-6 overflow-hidden flex-grow pb-4 max-h-[65vh]"
          >
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className="flex items-center space-x-4 max-w-[80%]">
                  {msg.sender === "user" ? (
                    <>
                      <div className="p-4 text-lg font-medium rounded-xl text-white bg-gray-700">
                        {msg.text}
                      </div>
                      <Image
                        src="/chatU.jpg"
                        width={50}
                        height={50}
                        className="rounded-full shadow-lg"
                        alt="User Profile"
                      />
                    </>
                  ) : (
                    <>
                      <Image
                        src="/chatB.jpg"
                        width={50}
                        height={50}
                        className="rounded-full shadow-lg"
                        alt="AI Profile"
                      />
                      <div className="p-4 text-lg font-medium rounded-xl text-white bg-blue-500">
                        {msg.text}
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}

            {/* Typing Indicators */}
            {isTyping.ai && (
              <div className="flex items-center space-x-4 justify-start">
                <Image
                  src="/chatB.jpg"
                  width={50}
                  height={50}
                  className="rounded-full shadow-lg"
                  alt="AI Profile"
                />
                <div className="p-3 bg-blue-500 text-lg font-medium rounded-xl text-white animate-pulse">
                  AI is typing...
                </div>
              </div>
            )}
            {isTyping.user && (
              <div className="flex items-center space-x-4 justify-end">
                <div className="p-3 bg-gray-700 text-lg font-medium rounded-xl text-white animate-pulse">
                  User is typing...
                </div>
                <Image
                  src="/chatU.jpg"
                  width={50}
                  height={50}
                  className="rounded-full shadow-lg"
                  alt="User Profile"
                />
              </div>
            )}
          </div>

          {/* Always Show the Call-to-Action (no condition) */}
          <div className="mt-6 text-center text-white text-xl font-semibold">
            <p>Need further assistance? Start a real-time chat with MedAI!</p>
          </div>
          <div className="mt-4 flex justify-center">
            {/* 3) Use router.push to navigate to your real-chat page */}
            <button
              className="px-8 py-4 bg-green-500 text-white rounded-lg text-xl font-semibold shadow-lg hover:bg-green-600 transition"
              onClick={() => router.push("/real-chat")}
            >
              Start Chat with MedAI
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
