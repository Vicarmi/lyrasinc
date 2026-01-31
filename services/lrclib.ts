
import { Track, LyricLine } from '../types';

const API_BASE = 'https://lrclib.net/api';

export const searchTracks = async (query: string): Promise<Track[]> => {
  try {
    const response = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error('Failed to fetch from LRCLIB');
    return await response.json();
  } catch (error) {
    console.error('Error searching tracks:', error);
    return [];
  }
};

export const getTrackLyrics = async (artist: string, title: string): Promise<Track | null> => {
  try {
    const response = await fetch(`${API_BASE}/get?artist_name=${encodeURIComponent(artist)}&track_name=${encodeURIComponent(title)}`);
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error('Error getting lyrics:', error);
    return null;
  }
};

export const parseLRC = (lrc: string): LyricLine[] => {
  const lines = lrc.split('\n');
  const result: LyricLine[] = [];
  const timeRegex = /\[(\d+):(\d+\.\d+)\]/;

  lines.forEach(line => {
    const match = timeRegex.exec(line);
    if (match) {
      const minutes = parseInt(match[1]);
      const seconds = parseFloat(match[2]);
      const time = minutes * 60 + seconds;
      const text = line.replace(timeRegex, '').trim();
      if (text) {
        result.push({ time, text });
      }
    }
  });

  return result.sort((a, b) => a.time - b.time);
};
