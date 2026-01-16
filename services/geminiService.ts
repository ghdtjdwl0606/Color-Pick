import { GoogleGenerativeAI } from "@google/generative-ai";
import { RecommendationResponse } from "./types";

export const generateColorsFromKeyword = async (keyword: string): Promise<RecommendationResponse> => {
  const apiKey = import.meta.env.VITE_API_KEY;
  
  if (!apiKey) {
    throw new Error("VITE_API_KEY가 없습니다.");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  
  // 가장 호환성이 높은 모델 명칭 사용
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `Create a 20-color palette for: "${keyword}". 
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
    // 사용자 화면에 출력될 메시지 (image_3d5b13 참고)
    throw new Error("서비스 연결에 실패했습니다. API 키 권한을 확인해주세요."); 
  }
};
