"use client";
import Navbar from "@/components/Navbar";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { faQuoteLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import CodeEditorDisplay from "@/components/CodeEditorDisplay";
import FeatureCard from "@/components/FeatureCard";
import Footer from "@/components/Footer";

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

      {/* main */}
      <div className="bg-[#0a090f] text-white selection:bg-white selection:text-black overflow-hidden">

        {/* hero */}
        <div className="relative bg-[#0a090f] w-screen h-screen">

          {/* Lines */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/4 w-[1px] h-full bg-[#353539] opacity-50 z-0"></div>
            <div className="absolute top-0 left-1/2 w-[1px] h-full bg-[#353539] opacity-50 z-0"></div>
            <div className="absolute top-0 left-3/4 w-[1px] h-full bg-[#353539] opacity-50 z-0"></div>
            <div className="absolute top-1/4 left-0 w-screen h-[1px] bg-[#353539] opacity-50 z-0"></div>
            <div className="absolute top-3/4 left-0 w-full h-[1px] bg-[#353539] opacity-50 z-0"></div>
         
          </div>

          {/* loopy */}
          <div className="flex items-center justify-center h-full">

            {/* Left Section */}
            <div className="w-2/5 h-1/2 relative z-20">
              
              <div className="w-full border-b-[1px] border-[#4a4a50] flex hover:border-[#71717a]">
                <h1 className="text-9xl font-extrabold m-4 font-space-grotesk pl-4">LOOPY</h1>
              </div>

              <div className="w-full pt-16">
                <CodeEditorDisplay />
                {/* <Image src="/images/platform.png" alt="Loopy" width={600} height={200} className="m-8" /> */}
              </div>

            </div>

            {/* Right Section */}
            <div className="w-2/6 h-1/2 border-[#353539] flex flex-col justify-between items-center relative overflow-hidden">
              
              <div className="w-full border-[1px] hover:border-[#4b4b52] p-3 mb-4 border-[#353539]">
                <span><FontAwesomeIcon icon={faQuoteLeft} className="pl-4" size="1x" /></span>
                <p className="text-base text-gray-300 font-normal m-4 mb-10 text-start hover:font-bold">
                  <span className="text-black text-lg font-extrabold bg-white">Loopy</span> is the ultimate platform for developers to store, share, and collaborate on code effortlessly. It simplifies knowledge-sharing through articles, discussions, and Q&A while fostering a vibrant community for open-source contributions and real-time collaboration. With instant chat, feedback-driven learning, and seamless code management, Loopy transforms the way developers connect, grow, and innovate.
                </p>
              </div>

              {/* Animated Features Section */}
              <div className="w-full flex border-[1px] border-[#353539] hover:border-[#4b4b52] items-center justify-center relative h-[40%]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.5 }}
                    className="absolute w-full flex flex-col items-center justify-center text-center"
                  >
                    <h2 className="text-2xl font-bold">{features[index].title}</h2>
                    <p className="text-lg text-gray-400 mt-2">{features[index].desc}</p>
                  </motion.div>
                </AnimatePresence>
              </div>

            </div>

          </div>

        </div>

        {/* why loopy */}
        <div className="relative bg-[#0a090f] w-screen pt-40 pb-40">

          {/* Lines */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/4 w-[1px] h-full bg-[#353539] opacity-50 z-0"></div>
            <div className="absolute top-0 left-1/2 w-[1px] h-full bg-[#353539] opacity-50 z-0"></div>
            <div className="absolute top-0 left-3/4 w-[1px] h-full bg-[#353539] opacity-50 z-0"></div>
          </div>

          {/* why loopy heading */}
          <div className="flex items-center justify-center h-full">
            {/* left Section */}
            <div className="w-2/6 h-1/2 border-[#353539] flex flex-col justify-between items-center relative overflow-hidden">
              <div className="w-full border-[1px] hover:border-[#71717a] p-3 mb-4 border-[#353539]">
                <span><FontAwesomeIcon icon={faQuoteLeft} className="pl-4" size="1x" /></span>
                <p className="text-lg text-gray-300 font-normal m-4 mb-10 text-start hover:font-bold hover:text-gray-300">
                  Snippets, Q&A, and a Thriving Developer Community.
                </p>
              </div>
            </div>
            <div className="w-2/5 pb-20 relative z-20">
              <div className="w-full border-b-[1px] border-[#4a4a50] flex hover:border-[#71717a]">
                <h1 className="text-6xl font-extrabold m-3 pl-20">Why Loopy?</h1>
              </div>
            </div>
          </div>

          {/* feature */}
          <div className="flex items-center justify-center pt-20">
            <div className="w-3/4 justify-center items-start flex gap-10">
              <FeatureCard title="Snippet" description="Easily upload your code snippets, categorize them for quick access, and share with the community. Find solutions at your fingertips." textColor=""/>
              <FeatureCard title = "Collaborate" description = "Join a thriving community of developers. Share, improve, and learn from code snippets, discussions, real-time Q&A, and collaborative projects." w = "2/5"/>
              <FeatureCard title = "VS Code" description = "Upload your code snippets directly from VS Code without leaving your editor. Stay focused while sharing and discovering new solutions."  textColor=""/>
            </div>
          </div>
          <div className="flex items-center justify-center pt-20">
            <div className="w-3/4 justify-center items-start flex gap-10">
              
              <FeatureCard title="Post" description="Post questions, articles, and solutions. Engage in real-time conversations with a developer community eager to share insights."/>
              <FeatureCard title = "Reusable Snip" description = "Upload reusable code snippets along withoutput images for better clarity. See results instantly and make the learning process easier." w = "2/5" textColor=""/>
              <FeatureCard title = "Chat" description = "Connect with community members instantly through real-time chat. Collaborate on projects, share ideas, or ask for help—whenever you need it." />
            </div>
          </div>


        </div>


      </div>

      <Footer />
    </>
  );

}
