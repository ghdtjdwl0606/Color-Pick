import { GoogleGenerativeAI } from "@google/generative-ai";
import { RecommendationResponse } from "./types";

export const generateColorsFromKeyword = async (keyword: string): Promise<RecommendationResponse> => {
  const apiKey = import.meta.env.VITE_API_KEY;
  
  if (!apiKey) {
    throw new Error("VITE_API_KEY가 없습니다.");
  }

  // API 키와 함께 옵션을 설정하지 않고 기본 인스턴스를 생성합니다.
  const genAI = new GoogleGenerativeAI(apiKey);
  
  // 가장 표준적인 모델 명칭인 'gemini-1.5-flash'를 사용합니다.
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash" 
  });

  const prompt = `Expert color theorist. Create a 20-color professional palette for: "${keyword}". 
    Return ONLY JSON format: { "recommendations": [{ "color": "hex", "name": "name", "description": "...", "styles": { "natural": "hex", "dramatic": "hex", "surreal": "hex" } }] }`;

  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        // 응답 형식을 JSON으로 강제합니다.
        responseMimeType: "application/json",
      },
    });

    const text = result.response.text();
    if (!text) throw new Error("AI 응답이 없습니다.");

    return JSON.parse(text) as RecommendationResponse;
  } catch (error: any) {
    console.error("Gemini 상세 에러:", error);
    // 에러 발생 시 사용자에게 노출될 문구
    throw new Error("서비스 연결에 실패했습니다. API 키 권한을 확인해주세요."); 
  }
};
