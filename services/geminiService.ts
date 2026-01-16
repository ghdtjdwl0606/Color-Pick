import { GoogleGenerativeAI } from "@google/generative-ai";
import { RecommendationResponse } from "./types";

export const generateColorsFromKeyword = async (keyword: string): Promise<RecommendationResponse> => {
  const apiKey = import.meta.env.VITE_API_KEY;
  
  if (!apiKey) {
    throw new Error("VITE_API_KEY가 설정되지 않았습니다.");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  
  // v1beta 에러를 피하기 위해 가장 기본 모델명을 사용합니다.
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash" 
  });
  
  const prompt = `Expert color theorist. Create a 20-color professional palette for: "${keyword}".
    Apply "Warm-Cool Contrast" for professional harmony.
    Return exactly 20 unique colors in JSON format.
    JSON structure should match: { "recommendations": [{ "color": "hex", "name": "colorname", "description": "...", "styles": { "natural": "hex", "dramatic": "hex", "surreal": "hex" } }] }`;

  try {
    // generationConfig를 모델 선언 시점이 아닌 콘텐츠 생성 시점에 명시합니다.
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const response = await result.response;
    const text = response.text();

    if (!text) throw new Error("AI 응답이 비어있습니다.");

    return JSON.parse(text) as RecommendationResponse;
  } catch (error: any) {
    console.error("Gemini 상세 에러 내용:", error);
    throw new Error("서비스 연결에 실패했습니다. API 키 권한을 확인해주세요.");
  }
};
