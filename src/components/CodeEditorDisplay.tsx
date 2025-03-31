import React, { useState } from 'react';

const LoopyCodeDisplay = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="relative max-w-xl mx-auto transition-all duration-500 hover:scale-105">
      <div className="absolute inset-0 bg-black/40 blur-3xl" />
      
      <div 
        className="relative bg-black rounded-xl p-6 text-gray-200 font-mono shadow-2xl border border-gray-800/50"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="text-sm text-gray-400 px-3 py-1.5 bg-gray-900 rounded-full border border-gray-800">
            loopy.tsx
          </div>
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-gray-600">1</span>
            <span className="text-gray-400">&lt;platform&gt;</span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-gray-600">2</span>
            <div className="ml-4">
              <span className="text-gray-400">&lt;features</span> 
              <span className="text-gray-300"> name</span>
              <span className="text-gray-400">=</span>
              <span className="text-gray-300">&quot;Loopy&quot;</span>
              <span className="text-gray-400">&gt;</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-gray-600">3</span>
            <div className="ml-8 group">
              <span className="text-gray-400">&lt;snippet /&gt;</span>
              <span className="ml-2 text-gray-600">{/* Easily upload code snippets */}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-gray-600">4</span>
            <div className="ml-8 group">
              <span className="text-gray-400">&lt;collaborate /&gt;</span>
              <span className="ml-2 text-gray-600">{/* Join developer community */}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-gray-600">5</span>
            <div className="ml-8 group">
              <span className="text-gray-400">&lt;vscode /&gt;</span>
              <span className="ml-2 text-gray-600">{/* VS Code integration */}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-gray-600">6</span>
            <div className="ml-8 group">
              <span className="text-gray-400">&lt;chat /&gt;</span>
              <span className="ml-2 text-gray-600">{/* Real-time discussions */}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-gray-600">7</span>
            <div className="ml-4">
              <span className="text-gray-400">&lt;/features&gt;</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-gray-600">8</span>
            <span className="text-gray-400">&lt;/platform&gt;</span>
          </div>
        </div>

        <div className="absolute -bottom-6 left-8">
          <div className="relative w-14 h-14 bg-black rounded-full flex items-center justify-center shadow-lg border border-gray-800">
            <div className="absolute w-10 h-10 border-2 border-gray-700 rounded-full animate-[spin_4s_linear_infinite]"></div>
            <div className="absolute w-10 h-10 border-2 border-gray-700 rounded-full animate-[spin_4s_linear_infinite] rotate-45"></div>
            <div className="absolute w-2.5 h-2.5 bg-gray-400 rounded-full"></div>
          </div>
        </div>

        <div className={`absolute left-44 top-1/2 -translate-y-1/2 transition-all duration-300 ${
          isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
        }`}>
          <div className="bg-black border border-gray-800 rounded-lg p-4 max-w-xs shadow-xl">
            <p className="text-sm text-gray-400 leading-relaxed">
              Share code snippets, collaborate with developers, and integrate with VS Code seamlessly. Join the community and elevate your coding experience.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoopyCodeDisplay;