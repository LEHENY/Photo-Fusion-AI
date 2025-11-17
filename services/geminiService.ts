
import { GoogleGenAI, Modality } from "@google/genai";

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

interface GenerateImageParams {
  baseImage: {
    data: string;
    mimeType: string;
  };
  logoImage: {
    data: string;
    mimeType: string;
  };
  prompt: string;
}

export const generateEditedImage = async ({
  baseImage,
  logoImage,
  prompt,
}: GenerateImageParams): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: baseImage.data,
              mimeType: baseImage.mimeType,
            },
          },
          {
            inlineData: {
              data: logoImage.data,
              mimeType: logoImage.mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        const base64ImageBytes: string = part.inlineData.data;
        const mimeType = part.inlineData.mimeType;
        return `data:${mimeType};base64,${base64ImageBytes}`;
      }
    }
    
    throw new Error("No image was generated in the response.");

  } catch (error) {
    console.error("Error generating image with Gemini:", error);
    if (error instanceof Error) {
        return Promise.reject(error.message);
    }
    return Promise.reject("An unknown error occurred while generating the image.");
  }
};
