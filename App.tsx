
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Track, LyricLine } from './types';
import { searchTracks, parseLRC } from './services/lrclib';
import { analyzeLyrics } from './services/geminiService';
import LyricDisplay from './components/LyricDisplay';
import MusicPlayer from './components/MusicPlayer';

const App: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<Track[]>([]);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analysisText, setAnalysisText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [wakeLock, setWakeLock] = useState<any>(null);

  // Wake Lock Logic: Keep screen on while reading lyrics
  useEffect(() => {
    const requestWakeLock = async () => {
      if ('wakeLock' in navigator && currentTrack) {
        try {
          const lock = await (navigator as any).wakeLock.request('screen');
          setWakeLock(lock);
        } catch (err) {
          console.error(`${err.name}, ${err.message}`);
        }
      }
    };

    if (currentTrack) {
      requestWakeLock();
    } else if (wakeLock) {
      wakeLock.release().then(() => setWakeLock(null));
    }

    return () => {
      if (wakeLock) wakeLock.release();
    };
  }, [currentTrack]);

  const parsedLyrics = useMemo(() => {
    if (currentTrack?.syncedLyrics) {
      return parseLRC(currentTrack.syncedLyrics);
    }
    return [];
  }, [currentTrack]);

  useEffect(() => {
    let interval: number;
    if (isPlaying && currentTrack) {
      interval = window.setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= (currentTrack.duration || 300)) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 0.5;
        });
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentTrack]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsLoading(true);
    const tracks = await searchTracks(searchQuery);
    setResults(tracks);
    setIsLoading(false);
  };

  const selectTrack = (track: Track) => {
    setCurrentTrack(track);
    setCurrentTime(0);
    setIsPlaying(true);
    setResults([]);
    setSearchQuery('');
  };

  const handleAnalyze = async () => {
    if (!currentTrack || isAnalyzing) return;
    const lyricsToAnalyze = currentTrack.syncedLyrics || currentTrack.plainLyrics;
    if (!lyricsToAnalyze) return;
    setIsAnalyzing(true);
    setShowAnalysis(true);
    const result = await analyzeLyrics(lyricsToAnalyze, currentTrack.trackName, currentTrack.artistName);
    setAnalysisText(result || "No se pudo realizar el análisis.");
    setIsAnalyzing(false);
  };

  return (
    <div className="relative h-screen w-screen bg-black text-white overflow-hidden flex flex-col safe-area-top safe-area-bottom">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 via-black to-purple-900/30" />
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(50,50,255,0.1),transparent_70%)]" />
      </div>

      {!currentTrack && (
        <div className="relative z-10 flex flex-col items-center justify-center h-full px-6 animate-in fade-in duration-700">
          <div className="mb-12 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-white to-white/20 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-2xl rotate-3">
              <i className="fas fa-music text-black text-3xl"></i>
            </div>
            <h1 className="text-6xl font-black mb-2 tracking-tighter italic">LyraSync</h1>
            <p className="text-white/40 font-medium tracking-widest uppercase text-xs">AI Lyrics Companion</p>
          </div>

          <form onSubmit={handleSearch} className="w-full max-w-md relative group">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="¿Qué suena ahora?"
              className="w-full bg-white/10 border border-white/10 rounded-3xl py-6 px-8 pl-16 text-xl focus:outline-none focus:ring-4 ring-white/5 transition-all placeholder:text-white/20 backdrop-blur-md"
            />
            <i className="fas fa-search absolute left-6 top-1/2 -translate-y-1/2 text-white/40"></i>
            {isLoading && <div className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>}
          </form>

          {results.length > 0 && (
            <div className="mt-8 w-full max-w-md bg-white/5 border border-white/10 rounded-3xl overflow-hidden max-h-[45vh] overflow-y-auto backdrop-blur-2xl shadow-2xl">
              {results.map(track => (
                <button key={track.id} onClick={() => selectTrack(track)} className="w-full p-5 flex items-center gap-4 hover:bg-white/10 active:bg-white/20 transition-all text-left border-b border-white/5 last:border-0">
                  <div className="flex-1 min-w-0">
                    <div className="font-bold truncate text-lg">{track.trackName}</div>
                    <div className="text-sm text-white/40 truncate font-medium">{track.artistName}</div>
                  </div>
                  <i className="fas fa-chevron-right text-white/20 text-xs"></i>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {currentTrack && (
        <div className="relative z-10 h-full flex flex-col animate-in slide-in-from-bottom duration-500">
          <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center bg-gradient-to-b from-black/90 via-black/40 to-transparent z-20">
            <button onClick={() => setCurrentTrack(null)} className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md active:scale-90 transition-transform">
              <i className="fas fa-chevron-left"></i>
            </button>
            <button onClick={handleAnalyze} className="h-12 px-6 rounded-full bg-white text-black font-bold flex items-center gap-2 active:scale-95 transition-all shadow-lg shadow-purple-500/20">
              <i className="fas fa-wand-magic-sparkles"></i>
              <span>IA</span>
            </button>
          </div>

          <LyricDisplay lyrics={parsedLyrics} currentTime={currentTime} onLineClick={setCurrentTime} />

          <MusicPlayer 
            trackName={currentTrack.trackName} 
            artistName={currentTrack.artistName} 
            isPlaying={isPlaying} 
            currentTime={currentTime} 
            duration={currentTrack.duration || 300} 
            onTogglePlay={() => setIsPlaying(!isPlaying)} 
            onSeek={setCurrentTime} 
            onClose={() => setCurrentTrack(null)} 
          />
        </div>
      )}

      {showAnalysis && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-xl flex items-end justify-center">
          <div className="bg-neutral-900 border-t border-white/10 w-full rounded-t-[3rem] overflow-hidden shadow-2xl p-8 pb-12 animate-in slide-in-from-bottom duration-300">
            <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-8" onClick={() => setShowAnalysis(false)}></div>
            <h3 className="text-2xl font-black mb-6 flex items-center gap-3">
              <i className="fas fa-sparkles text-purple-400"></i>
              Esencia de la Obra
            </h3>
            <div className="max-h-[50vh] overflow-y-auto text-white/70 leading-relaxed text-lg pb-4">
              {isAnalyzing ? (
                <div className="flex items-center gap-3 italic text-white/30">
                  <div className="w-4 h-4 border-2 border-white/10 border-t-white/60 rounded-full animate-spin"></div>
                  Descifrando versos...
                </div>
              ) : analysisText}
            </div>
            <button onClick={() => setShowAnalysis(false)} className="w-full py-4 mt-6 bg-white/10 rounded-2xl font-bold">Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
