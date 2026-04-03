import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function generateFoodImage(prompt: string): Promise<string> {
  // Map common food items to high-quality Unsplash keywords for better fallbacks
  const fallbackMap: Record<string, string> = {
    "vadai": "https://images.unsplash.com/photo-1626132646529-500637532537?auto=format&fit=crop&w=400&h=400&q=80",
    "puri": "https://images.unsplash.com/photo-1626776876729-bab4369a5a5a?auto=format&fit=crop&w=400&h=400&q=80",
    "idli": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=400&h=400&q=80",
    "dosa": "https://images.unsplash.com/photo-1541014741259-df529411b96a?auto=format&fit=crop&w=400&h=400&q=80",
    "coffee": "https://images.unsplash.com/photo-1541167760496-162955ed8a9f?auto=format&fit=crop&w=400&h=400&q=80",
    "tea": "https://images.unsplash.com/photo-1544787210-2213d44ad53e?auto=format&fit=crop&w=400&h=400&q=80"
  };

  const lowerPrompt = prompt.toLowerCase();
  const fallbackUrl = Object.entries(fallbackMap).find(([key]) => lowerPrompt.includes(key))?.[1] 
    || `https://picsum.photos/seed/${encodeURIComponent(prompt)}/400/400`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: `A high-quality, professional food photography shot of ${prompt}. Served on a traditional South Indian plate or banana leaf. Vibrant colors, appetizing, 4k resolution.`,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
        },
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return fallbackUrl;
  } catch (error: any) {
    // Check specifically for quota exceeded (429)
    if (error?.message?.includes('429') || error?.status === 429) {
      console.warn("Gemini API Quota exceeded. Using high-quality fallback image for:", prompt);
    } else {
      console.error("Image generation error:", error);
    }
    return fallbackUrl;
  }
}
