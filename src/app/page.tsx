"use client";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { faQuoteLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

export default function Home() {
  const features = [
    { title: "VS Code Integration", desc: "Upload and manage code snippets directly from your editor." },
    { title: "Code Snippet Library", desc: "Categorized snippets for a wide range of programming needs." },
    { title: "Q&A & Articles", desc: "Ask questions, share articles, and discuss technical topics." },
    { title: "Community Creation", desc: "Build your own developer communities." },
    { title: "Real-time Chat", desc: "Instantly connect and collaborate with fellow developers." }
  ];

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % features.length);
    }, 3000); // Change feature every 3 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Navbar />

      {/* Hero Section */}
      <main className="bg-[#0a090f] w-screen h-screen flex items-center justify-center text-white">
        {/* Left Section */}
        <div className="w-2/5 h-1/2 border-[1px] border-[#353539] border-r-0">
          <div className="w-full border-b-[1px] border-[#353539] border-r-[1px] flex">
            <h1 className="text-9xl font-bold pl-4">LOOPY</h1>
          </div>
          <div className="w-full m-4">
            <p className="text-lg font-normal m-6">
             
            </p>
          </div>
        </div>

        {/* Right Section (Features Slider) */}
        <div className="w-2/6 h-1/2 border-[1px] border-l-0 border-r-0 border-[#353539] flex flex-col justify-between items-center relative overflow-hidden">
          {/* Static Description Section */}
          <div className="w-full border-b-[1px] border-l-[1px] border-r-[1px] p-3 mb-4 border-[#353539]">
            <span><FontAwesomeIcon icon={faQuoteLeft} className="pl-4" size="1x" /></span>
            <p className="text-base font-normal m-4 mb-10 text-start">
              Loopy is the ultimate platform for developers to store, share, and collaborate on code effortlessly.
              It simplifies knowledge-sharing through articles, discussions, and Q&A while fostering a vibrant community for open-source contributions
              and real-time collaboration. With instant chat, feedback-driven learning, and seamless code management, Loopy transforms the way
              developers connect, grow, and innovate.
            </p>
          </div>

          {/* Animated Features Section */}
          <div className="w-full flex  border-[1px] border-l-[1px] border-[#353539] items-center justify-center relative h-[40%]">
            <AnimatePresence mode="wait">
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 100 }}  // Starts off-screen (right)
                animate={{ opacity: 1, x: 0 }}   // Moves into view
                exit={{ opacity: 0, x: -100 }}   // Moves out to the left
                transition={{ duration: 0.6 }}
                className="absolute w-full flex flex-col items-center justify-center text-center"
              >
                <h2 className="text-xl font-bold">{features[index].title}</h2>
                <p className="text-base text-gray-300 mt-2">{features[index].desc}</p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

      </main>
    </>
  );
}
