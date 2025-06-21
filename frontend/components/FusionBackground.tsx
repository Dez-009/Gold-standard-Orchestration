import React from 'react';

interface FusionBackgroundProps {
  children: React.ReactNode;
  className?: string;
}

export default function FusionBackground({ children, className = '' }: FusionBackgroundProps) {
  return (
    <div className={`fusion-background ${className}`}>
      {/* Floating particles */}
      <div className="floating-particles">
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
} 