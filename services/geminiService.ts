import { GoogleGenerativeAI } from "@google/generative-ai";
import { RecommendationResponse } from "./types";

export const generateColorsFromKeyword = async (keyword: string): Promise<RecommendationResponse> => {
  const apiKey = import.meta.env.VITE_API_KEY;
  if (!apiKey) throw new Error("API 키가 없습니다.");

  const genAI = new GoogleGenerativeAI(apiKey);
  
  // v1beta 대신 v1을 명시하거나, SDK가 최적의 경로를 잡도록 모델명만 정확히 기입합니다.
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: `Create a 20-color palette for: "${keyword}". Return ONLY JSON format.` }] }],
      generationConfig: {
        responseMimeType: "application/json", // JSON 응답 강제
      },
    });

    const text = result.response.text();
    return JSON.parse(text) as RecommendationResponse;
  } catch (error: any) {
    console.error("상세 에러:", error);
    // 만약 여전히 404가 뜬다면 모델명을 "gemini-1.5-flash-latest"로 바꿔보세요.
    throw new Error("AI 호출 실패. API 키 활성화 대기 중일 수 있습니다.");
  }
};
