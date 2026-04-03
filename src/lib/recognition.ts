import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import { evaluate } from "mathjs";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function recognizeHandwriting(base64Image: string): Promise<{ text: string; value: number }> {
  try {
    // Remove the data:image/png;base64, prefix
    const data = base64Image.split(',')[1];
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: data,
            },
          },
          {
            text: "Return ONLY the handwritten number or simple math (e.g. '5' or '2x3'). Detect 'x' as multiplication. If empty, return '0'.",
          },
        ],
      },
      config: {
        thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL }
      }
    });

    const text = response.text?.trim() || "0";
    
    // Clean the text: replace x or X with *
    const cleanedExpression = text.toLowerCase().replace(/x/g, '*').replace(/[^0-9*+-\/().]/g, '');
    
    let value = 0;
    try {
      if (cleanedExpression) {
        value = evaluate(cleanedExpression);
      }
    } catch (e) {
      console.error("Math evaluation error:", e);
      value = 0;
    }

    return { text, value };
  } catch (error) {
    console.error("Recognition error:", error);
    return { text: "Error", value: 0 };
  }
}
