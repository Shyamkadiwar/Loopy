"use client";
import { motion } from "framer-motion";
import React, { useState, useEffect } from "react";

interface AnimatedTextProps {
  text: string;
  className?: string;
}

const AnimatedText: React.FC<AnimatedTextProps> = ({ text, className = "" }) => {
  const letters = text.split("");
  const [displayText, setDisplayText] = useState<string[]>(letters);
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    let scrambleTimeouts: NodeJS.Timeout[] = [];

    if (hovering) {
      letters.forEach((_, i) => {
        scrambleTimeouts.push(
          setTimeout(() => {
            let scrambledChar = randomChar();
            let scrambleInterval = setInterval(() => {
              scrambledChar = randomChar();
              setDisplayText((prev) => {
                const newText = [...prev];
                newText[i] = scrambledChar;
                return newText;
              });
            }, 50);

            setTimeout(() => {
              clearInterval(scrambleInterval);
              setDisplayText((prev) => {
                const newText = [...prev];
                newText[i] = letters[i]; // Set the original character back
                return newText;
              });
            }, 500);
          }, i * 100) // Delay each letter scrambling
        );
      });
    }

    return () => scrambleTimeouts.forEach(clearTimeout);
  }, [hovering]);

  const randomChar = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*?";
    return chars[Math.floor(Math.random() * chars.length)];
  };

  return (
    <motion.div
      className={`flex ${className}`}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      {displayText.map((char, index) => (
        <motion.span
          key={index}
          className="text-white transition-all duration-200"
        >
          {char}
        </motion.span>
      ))}
    </motion.div>
  );
};

export default AnimatedText;
