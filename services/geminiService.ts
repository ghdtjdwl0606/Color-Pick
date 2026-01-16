import { GoogleGenerativeAI } from "@google/generative-ai";
import { RecommendationResponse } from "./types";

export const generateColorsFromKeyword = async (keyword: string): Promise<RecommendationResponse> => {
  const apiKey = import.meta.env.VITE_API_KEY;
  if (!apiKey) throw new Error("API 키가 설정되지 않았습니다.");

  const genAI = new GoogleGenerativeAI(apiKey);
  
  // 'models/' 접두사 없이 모델명만 정확히 입력합니다.
  // v1beta 에러가 지속되면 SDK가 내부적으로 경로를 잘못 잡는 것이므로 
  // 가장 기본형인 gemini-1.5-flash를 사용합니다.
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash" 
  });

  const prompt = `Expert color theorist. Create a 20-color professional palette for: "${keyword}".
    Return in JSON format: { "recommendations": [{ "color": "hex", "name": "name", "description": "...", "styles": { "natural": "hex", "dramatic": "hex", "surreal": "hex" } }] }`;

  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const response = await result.response;
    const text = response.text();
    return JSON.parse(text) as RecommendationResponse;
  } catch (error: any) {
    console.error("Gemini 상세 에러:", error);
    // 404 에러가 계속되면 모델명을 "gemini-1.5-flash-latest"로 한 번 더 시도해볼 수 있습니다.
    throw new Error("AI 호출에 실패했습니다. API 키가 아직 활성화되지 않았거나 설정 오류일 수 있습니다.");
  }
};
