import { GoogleGenerativeAI } from "@google/generative-ai";
import { RecommendationResponse } from "./types";

export const generateColorsFromKeyword = async (keyword: string): Promise<RecommendationResponse> => {
  const apiKey = import.meta.env.VITE_API_KEY;
  
  if (!apiKey) {
    throw new Error("VITE_API_KEY가 설정되지 않았습니다.");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  
  // 'models/' 없이 순수 모델명만 입력하거나, SDK 버전에 맞는 형식을 사용합니다.
  // 에러 로그에서 v1beta를 사용 중이므로 가장 기본 명칭이 안전합니다.
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash", 
    generationConfig: {
      responseMimeType: "application/json",
    },
  });
  
  const prompt = `Expert color theorist. Create a 20-color professional palette for: "${keyword}".
    Return exactly 20 colors in JSON format according to the schema.
    Each color must have 3 style variations: "Natural", "Dramatic", "Surreal".`;

  try {
    // API 호출 전 keyword 확인
    if (!keyword.trim()) throw new Error("키워드를 입력해주세요.");

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    if (!text) throw new Error("AI 응답이 비어있습니다.");

    return JSON.parse(text) as RecommendationResponse;
  } catch (error: any) {
    // 상세 에러 로깅
    console.error("Gemini API Error Details:", error);
    
    // 만약 404가 계속된다면, API Key의 권한이나 리전(Region) 제한 문제일 수 있습니다.
    throw new Error("서비스 연결에 실패했습니다. API 키 설정을 확인하거나 잠시 후 다시 시도해주세요.");
  }
};
