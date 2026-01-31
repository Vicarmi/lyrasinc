
export interface Track {
  id: number;
  trackName: string;
  artistName: string;
  albumName: string;
  duration: number;
  instrumental: boolean;
  plainLyrics?: string;
  syncedLyrics?: string;
}

export interface LyricLine {
  time: number; // seconds
  text: string;
}

export interface AppState {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  searchQuery: string;
  results: Track[];
  loading: boolean;
  error: string | null;
}
