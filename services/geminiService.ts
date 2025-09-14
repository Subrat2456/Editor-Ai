
import { GoogleGenAI, Modality } from "@google/genai";
import type { GenerateContentResponse } from "@google/genai";

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const editImageWithAI = async (
  base64ImageData: string,
  mimeType: string,
  prompt: string
): Promise<{ dataUrl: string; mimeType: string; } | null> => {
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image-preview',
      contents: [{ // The entire contents object must be inside an array
        parts: [
          {
            inlineData: {
              data: base64ImageData,
              mimeType: mimeType,
            },
          },
          { text: prompt },
        ],
      }],
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        const newBase64 = part.inlineData.data;
        const newMimeType = part.inlineData.mimeType;
        return { dataUrl: `data:${newMimeType};base64,${newBase64}`, mimeType: newMimeType };
      }
    }
    // If no image is returned, it means the API might have just returned text.
    console.warn("AI response did not contain an image part.", response.text);
    return null;

  } catch (error) {
    console.error("Error editing image with Gemini API:", error);
    throw new Error("Failed to process image with AI. Please check your prompt or try again.");
  }
};