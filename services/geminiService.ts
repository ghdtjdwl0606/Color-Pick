import { GoogleGenerativeAI } from "@google/generative-ai";
import { RecommendationResponse } from "./types";

export const generateColorsFromKeyword = async (keyword: string): Promise<RecommendationResponse> => {
  const apiKey = import.meta.env.VITE_API_KEY;
  if (!apiKey) throw new Error("API 키가 설정되지 않았습니다.");

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

  // 1. 데이터 양을 최소화하여 전송 누락 방지 (12개로 고정)
  const prompt = `Expert color theorist. Create a 12-color palette for: "${keyword}". 
    Return ONLY JSON: { "recommendations": [{ "color": "hex", "name": "name", "description": "desc", "styles": { "natural": "hex", "dramatic": "hex", "surreal": "hex" } }] }`;

  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        maxOutputTokens: 1500, // 충분한 토큰 확보
        temperature: 0.7,      // 창의성과 안정성의 균형
      },
    });

    const response = await result.response;
    const text = response.text();

    // 2. 비정상적인 응답 텍스트 로깅 (디버깅용)
    if (!text || text.length < 50) {
      console.error("AI 응답 데이터 부족:", text);
      return { recommendations: [] };
    }

    try {
      const data = JSON.parse(text);
      // 3. 데이터 구조가 유효한지 최종 검사
      if (data && Array.isArray(data.recommendations)) {
        return data as RecommendationResponse;
      }
      return { recommendations: [] };
    } catch (parseError) {
      console.error("JSON 파싱 에러 발생:", parseError);
      return { recommendations: [] };
    }

  } catch (error: any) {
    console.error("Gemini 호출 치명적 에러:", error);
    return { recommendations: [] };
  }
};
