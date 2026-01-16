import { GoogleGenerativeAI } from "@google/generative-ai";
import { RecommendationResponse } from "./types";

export const generateColorsFromKeyword = async (keyword: string): Promise<RecommendationResponse> => {
  const apiKey = import.meta.env.VITE_API_KEY;
  if (!apiKey) throw new Error("API 키가 없습니다.");

  const genAI = new GoogleGenerativeAI(apiKey);
  // 현재 계정에서 활성화된 최신 모델 사용
  const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

  const prompt = `Expert color theorist. Create exactly 20 professional colors for: "${keyword}".
    Return ONLY a valid JSON object. Do not include markdown formatting or extra text.
    Structure:
    {
      "recommendations": [
        {
          "color": "#HEX",
          "name": "name",
          "description": "desc",
          "styles": { "natural": "#HEX", "dramatic": "#HEX", "surreal": "#HEX" }
        }
      ]
    }`;

  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        // AI가 JSON 형식을 엄격히 지키도록 설정
        responseMimeType: "application/json",
        maxOutputTokens: 2048, // 응답이 중간에 끊기지 않도록 충분한 길이 설정
      },
    });

    const response = await result.response;
    const text = response.text();

    // 텍스트가 비어있는지 확인하여 SyntaxError 방지
    if (!text || text.trim().length === 0) {
      throw new Error("AI로부터 빈 응답을 받았습니다.");
    }

    return JSON.parse(text) as RecommendationResponse;
  } catch (error: any) {
    console.error("Gemini 상세 에러:", error);
    // 에러 발생 시 사용자에게 안전한 기본 구조 반환
    return { recommendations: [] };
  }
};
