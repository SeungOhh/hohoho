
import { GoogleGenAI, Chat } from "@google/genai";
import { Part } from "./types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set. Please add it to your environment.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export function startChat(): Chat {
  return ai.chats.create({
    model: 'gemini-2.5-flash',
  });
}

export const fileToGenerativePart = async (file: File): Promise<Part> => {
  const base64EncodedDataPromise = new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        // The result includes the data URL prefix "data:image/jpeg;base64,", we only want the base64 part.
        resolve(reader.result.split(',')[1]);
      } else {
        reject(new Error("Failed to read file as data URL."));
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });

  return {
    inlineData: {
      data: await base64EncodedDataPromise,
      mimeType: file.type,
    },
  };
};
