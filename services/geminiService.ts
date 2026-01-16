import { GoogleGenerativeAI } from "@google/generative-ai";
import { RecommendationResponse } from "../types";

export const generateColorsFromKeyword = async (keyword: string): Promise<RecommendationResponse> => {
  // Vite 방식의 환경 변수 호출 (Vercel Settings에 VITE_API_KEY가 있어야 함)
  const apiKey = import.meta.env.VITE_API_KEY;
  
  if (!apiKey) {
    throw new Error("Gemini API_KEY가 설정되지 않았습니다. Vercel 환경 변수에 'VITE_API_KEY'를 추가해 주세요.");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
    },
  });
  
  const prompt = `Expert color theorist. Create a 20-color professional palette for: "${keyword}".
    Apply "Warm-Cool Contrast" (한난대비) for professional harmony.
    Exactly 20 unique colors.
    Each color needs 3 style variations: "Natural", "Dramatic", "Surreal". 
    Return in JSON format according to the schema.`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  try {
    return JSON.parse(text) as RecommendationResponse;
  } catch (error) {
    console.error("JSON Parse Error:", text);
    throw new Error("데이터 형식이 올바르지 않습니다.");
  }
};
