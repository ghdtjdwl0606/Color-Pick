import { GoogleGenerativeAI } from "@google/generative-ai";
import { RecommendationResponse } from "./types";

export const generateColorsFromKeyword = async (keyword: string): Promise<RecommendationResponse> => {
  // 1. 최상단에 생성한 키 중 하나를 Vercel 환경 변수에 정확히 입력했는지 확인하세요.
  const apiKey = import.meta.env.VITE_API_KEY;
  
  if (!apiKey) {
    throw new Error("VITE_API_KEY가 없습니다.");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  
  // 2. 모델명을 'gemini-1.5-flash'로 고정 (접두사 없이 사용)
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
    
    if (!text) throw new Error("AI 응답이 비어있습니다.");
    
    return JSON.parse(text) as RecommendationResponse;
  } catch (error: any) {
    console.error("Gemini 상세 에러:", error);
    // 현재 화면에 뜨는 메시지 (image_3d5b13 참고)
    throw new Error("서비스 연결에 실패했습니다. API 키 권한을 확인해주세요.");
  }
};
