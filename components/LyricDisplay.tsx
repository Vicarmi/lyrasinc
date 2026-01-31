
import React, { useEffect, useRef } from 'react';
import { LyricLine } from '../types';

interface LyricDisplayProps {
  lyrics: LyricLine[];
  currentTime: number;
  onLineClick: (time: number) => void;
}

const LyricDisplay: React.FC<LyricDisplayProps> = ({ lyrics, currentTime, onLineClick }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeLineRef = useRef<HTMLDivElement>(null);

  // Find the current active line
  const activeIndex = lyrics.findIndex((line, index) => {
    const nextLine = lyrics[index + 1];
    return currentTime >= line.time && (!nextLine || currentTime < nextLine.time);
  });

  useEffect(() => {
    if (activeLineRef.current && containerRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [activeIndex]);

  return (
    <div 
      ref={containerRef}
      className="h-full w-full overflow-y-auto px-8 pt-40 pb-64 space-y-8 select-none"
      style={{ scrollBehavior: 'smooth' }}
    >
      {lyrics.length > 0 ? (
        lyrics.map((line, index) => {
          const isActive = index === activeIndex;
          const isPast = index < activeIndex;
          
          return (
            <div
              key={`${line.time}-${index}`}
              ref={isActive ? activeLineRef : null}
              onClick={() => onLineClick(line.time)}
              className={`transition-all duration-500 cursor-pointer origin-left transform
                ${isActive ? 'text-white text-3xl font-bold opacity-100 scale-105' : 
                  isPast ? 'text-white/40 text-2xl font-semibold scale-100' : 
                  'text-white/20 text-2xl font-semibold scale-95'}
              `}
            >
              {line.text}
            </div>
          );
        })
      ) : (
        <div className="text-white/30 text-center text-xl italic pt-20">
          No hay letras sincronizadas disponibles para esta canción.
        </div>
      )}
    </div>
  );
};

export default LyricDisplay;
