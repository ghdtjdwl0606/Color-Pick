import { GoogleGenerativeAI } from "@google/generative-ai";
import { RecommendationResponse } from "./types"; // 현재 폴더 구조에 맞춰 경로 확인 (image_3cf630 기준)

export const generateColorsFromKeyword = async (keyword: string): Promise<RecommendationResponse> => {
  // Vite 방식의 환경 변수 호출
  const apiKey = import.meta.env.VITE_API_KEY;
  
  if (!apiKey) {
    throw new Error("Gemini API_KEY가 설정되지 않았습니다. Vercel 환경 변수에 'VITE_API_KEY'를 추가해 주세요.");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  
  // 모델 설정 수정: "models/" 접두사 추가
  const model = genAI.getGenerativeModel({
    model: "models/gemini-1.5-flash", 
    generationConfig: {
      responseMimeType: "application/json",
    },
  });
  
  const prompt = `Expert color theorist. Create a 20-color professional palette for: "${keyword}".
    Apply "Warm-Cool Contrast" (한난대비) for professional harmony.
    Exactly 20 unique colors.
    Each color needs 3 style variations: "Natural", "Dramatic", "Surreal". 
    Return in JSON format according to the schema.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    if (!text) {
      throw new Error("AI 응답이 비어있습니다.");
    }

    return JSON.parse(text) as RecommendationResponse;
  } catch (error) {
    console.error("Gemini API Error:", error);
    // 404 에러나 파싱 에러 발생 시 사용자에게 명확한 메시지 전달
    throw new Error("컬러를 생성하는 도중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
  }
};
