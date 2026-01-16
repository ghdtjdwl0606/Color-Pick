import { GoogleGenerativeAI } from "@google/generative-ai";
import { RecommendationResponse } from "./types"; // 현재 구조상 루트에 있으므로 ./types

export const generateColorsFromKeyword = async (keyword: string): Promise<RecommendationResponse> => {
  const apiKey = import.meta.env.VITE_API_KEY;
  
  if (!apiKey) {
    throw new Error("VITE_API_KEY가 설정되지 않았습니다.");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  
  // 1. 모델 이름을 'gemini-1.5-flash-latest'로 변경 시도
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash-latest", 
    generationConfig: {
      responseMimeType: "application/json",
    },
  });
  
  const prompt = `Expert color theorist. Create a 20-color professional palette for: "${keyword}".
    Apply "Warm-Cool Contrast" (한난대비) for professional harmony.
    Exactly 20 unique colors.
    Each color needs 3 style variations: "Natural", "Dramatic", "Surreal". 
    Return in JSON format according to the schema.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    if (!text) throw new Error("AI 응답이 비어있습니다.");

    return JSON.parse(text) as RecommendationResponse;
  } catch (error: any) {
    console.error("Gemini API 상세 에러:", error);
    
    // 만약 여전히 404가 뜬다면, 모델명을 "models/gemini-1.5-flash"로 다시 시도해 보세요.
    throw new Error("컬러를 생성하는 도중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
  }
};
