
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeLyrics = async (lyrics: string, song: string, artist: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Explicate el significado profundo y el contexto emocional de la siguiente canción: "${song}" de ${artist}. Aquí están las letras: \n\n${lyrics}`,
      config: {
        systemInstruction: "Eres un experto musicólogo con gran sensibilidad lírica. Responde de forma concisa y poética en español."
      }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini analysis error:", error);
    return "No se pudo analizar la letra en este momento.";
  }
};

export const getSimilarSongs = async (song: string, artist: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Basado en la canción "${song}" de ${artist}, recomienda 5 canciones similares en estilo o temática. Solo devuelve los nombres de las canciones y artistas en formato de lista.`,
    });
    return response.text;
  } catch (error) {
    return "No se pudieron obtener recomendaciones.";
  }
};
