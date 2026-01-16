import { GoogleGenerativeAI } from "@google/generative-ai";
import { RecommendationResponse } from "./types";

export const generateColorsFromKeyword = async (keyword: string): Promise<RecommendationResponse> => {
  const apiKey = import.meta.env.VITE_API_KEY;
  if (!apiKey) throw new Error("API 키가 설정되지 않았습니다.");

  const genAI = new GoogleGenerativeAI(apiKey);
  
  // v1beta 에러를 방지하기 위해 가장 표준 모델명을 사용합니다.
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `Expert color theorist. Create a 20-color professional palette for: "${keyword}".
    Return ONLY JSON: { "recommendations": [{ "color": "hex", "name": "name", "description": "...", "styles": { "natural": "hex", "dramatic": "hex", "surreal": "hex" } }] }`;

  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const text = result.response.text();
    return JSON.parse(text) as RecommendationResponse;
  } catch (error: any) {
    console.error("Gemini 상세 에러:", error);
    throw new Error("서비스 연결에 실패했습니다. API 키 권한을 확인해주세요.");
  }
};
