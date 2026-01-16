import { GoogleGenerativeAI } from "@google/generative-ai";
import { RecommendationResponse } from "./types";

export const generateColorsFromKeyword = async (keyword: string): Promise<RecommendationResponse> => {
  const apiKey = import.meta.env.VITE_API_KEY;
  if (!apiKey) throw new Error("API 키가 설정되지 않았습니다.");

  // 1. SDK가 v1beta 대신 v1을 사용하도록 명시적으로 유도 (일부 환경에서 필요)
  const genAI = new GoogleGenerativeAI(apiKey);
  
  // 2. 모델명을 "gemini-1.5-flash"로 유지하되, 호출 방식을 가장 원시적인 형태로 변경
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash" 
  });

  const prompt = `Expert color theorist. Create a 20-color professional palette for: "${keyword}".
    Return in JSON format: { "recommendations": [] }`;

  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      // 3. 응답 형식을 JSON으로 강제
      generationConfig: { responseMimeType: "application/json" }
    });

    const text = result.response.text();
    return JSON.parse(text) as RecommendationResponse;
  } catch (error: any) {
    console.error("Gemini 상세 에러:", error);
    // 4. 만약 여전히 404가 뜨면 API 키를 '새 프로젝트'에서 다시 생성해야 합니다.
    throw new Error("AI 모델을 찾을 수 없습니다. API 키 권한을 확인하세요.");
  }
};
