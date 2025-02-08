import React from "react";

// Define the type for props
interface FeatureCardProps {
  title: string;
  description: string;
  textColor?: string; // Optional prop with default value
  w? : string
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, textColor = "white", w = "1/4"}) => {
  return (
    <div className="w-1/4 h-full border-[1px] border-[#353539] transition-all duration-500 hover:scale-105">
      <div
        className={`border-b-[1px] bg-${textColor} text-center   text-lg border-r-[1px] border-[#353539] w-${w} p-2 font-bold font-space-grotesk ${
          textColor === "white" ? "text-black" : "text-white"
        }`}
      >
        <h1>{title}</h1>
      </div>
      <p className="p-6 text-gray-300">{description}</p>
    </div>
  );
};

export default FeatureCard;
