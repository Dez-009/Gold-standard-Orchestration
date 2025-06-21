'use client';

import FusionBackground from '../../components/FusionBackground';
import Link from 'next/link';

export default function FusionDemoPage() {
  return (
    <FusionBackground>
      <div className="flex flex-col items-center justify-center min-h-screen p-4 space-y-8">
        <h1 className="text-5xl font-bold text-white text-center mb-4">
          Fusion Background Demo
        </h1>
        
        <p className="text-white/80 text-xl text-center max-w-2xl">
          Experience the beautiful animated fusion gradient background with floating particles and glass morphism effects.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">
          <div className="glass-card rounded-lg p-6 text-white">
            <h2 className="text-2xl font-semibold mb-4">Glass Card Effect</h2>
            <p className="text-white/80 mb-4">
              This card demonstrates the glass morphism effect with backdrop blur and subtle transparency.
            </p>
            <button className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-all duration-200">
              Hover Me
            </button>
          </div>

          <div className="glass-card rounded-lg p-6 text-white">
            <h2 className="text-2xl font-semibold mb-4">Animated Background</h2>
            <p className="text-white/80 mb-4">
              The background features a smooth gradient animation that shifts between vibrant colors.
            </p>
            <div className="flex space-x-2">
              <div className="w-4 h-4 bg-orange-400 rounded-full"></div>
              <div className="w-4 h-4 bg-pink-500 rounded-full"></div>
              <div className="w-4 h-4 bg-blue-400 rounded-full"></div>
              <div className="w-4 h-4 bg-green-400 rounded-full"></div>
            </div>
          </div>

          <div className="glass-card rounded-lg p-6 text-white">
            <h2 className="text-2xl font-semibold mb-4">Floating Particles</h2>
            <p className="text-white/80 mb-4">
              Subtle floating particles add depth and movement to the background.
            </p>
            <div className="text-sm text-white/60">
              Watch the particles gently float and rotate in the background.
            </div>
          </div>

          <div className="glass-card rounded-lg p-6 text-white">
            <h2 className="text-2xl font-semibold mb-4">User Pages</h2>
            <p className="text-white/80 mb-4">
              This fusion background is now applied to all user pages for a consistent, modern experience.
            </p>
            <Link 
              href="/user/goals" 
              className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-all duration-200"
            >
              View Goals Page
            </Link>
          </div>
        </div>

        <div className="flex space-x-4 mt-8">
          <Link 
            href="/dashboard" 
            className="px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-all duration-200 font-semibold"
          >
            Back to Dashboard
          </Link>
          <Link 
            href="/user/journals" 
            className="px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-all duration-200 font-semibold"
          >
            View Journals
          </Link>
        </div>
      </div>
    </FusionBackground>
  );
} 