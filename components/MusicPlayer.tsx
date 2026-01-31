
import React from 'react';

interface MusicPlayerProps {
  trackName: string;
  artistName: string;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onTogglePlay: () => void;
  onSeek: (time: number) => void;
  onClose: () => void;
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({
  trackName,
  artistName,
  isPlaying,
  currentTime,
  duration,
  onTogglePlay,
  onSeek,
  onClose
}) => {
  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-8 pt-20 backdrop-blur-sm">
      <div className="max-w-xl mx-auto">
        <div className="flex justify-between items-end mb-4">
          <div>
            <h2 className="text-2xl font-bold truncate">{trackName}</h2>
            <p className="text-white/60 font-medium truncate">{artistName}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-white/40 hover:text-white"
          >
            <i className="fas fa-chevron-down text-xl"></i>
          </button>
        </div>

        {/* Progress Bar */}
        <div className="relative w-full h-1 bg-white/20 rounded-full mb-2 cursor-pointer group"
             onClick={(e) => {
               const rect = e.currentTarget.getBoundingClientRect();
               const x = e.clientX - rect.left;
               const pct = x / rect.width;
               onSeek(pct * duration);
             }}>
          <div 
            className="absolute top-0 left-0 h-full bg-white rounded-full transition-all duration-100"
            style={{ width: `${(currentTime / duration) * 100}%` }}
          />
          <div 
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ left: `${(currentTime / duration) * 100}%` }}
          />
        </div>

        <div className="flex justify-between text-xs text-white/40 mb-6">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>

        <div className="flex justify-center items-center gap-10">
          <button className="text-white/60 hover:text-white transition-colors">
            <i className="fas fa-random text-xl"></i>
          </button>
          <button className="text-white hover:scale-110 transition-transform">
            <i className="fas fa-step-backward text-2xl"></i>
          </button>
          <button 
            onClick={onTogglePlay}
            className="w-16 h-16 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 transition-transform"
          >
            <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'} text-2xl ml-0.5`}></i>
          </button>
          <button className="text-white hover:scale-110 transition-transform">
            <i className="fas fa-step-forward text-2xl"></i>
          </button>
          <button className="text-white/60 hover:text-white transition-colors">
            <i className="fas fa-redo text-xl"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MusicPlayer;
