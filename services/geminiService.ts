import { GoogleGenerativeAI } from "@google/generative-ai"; // 1. 올바른 라이브러리 임포트
import { RecommendationResponse } from "../types";

export const generateColorsFromKeyword = async (keyword: string): Promise<RecommendationResponse> => {
  // 2. Vite 전용 환경 변수 참조 방식 사용
  const apiKey = import.meta.env.VITE_API_KEY;
  
  if (!apiKey) {
    throw new Error("Gemini API_KEY가 설정되지 않았습니다. Vercel에서 'VITE_API_KEY'를 추가해 주세요.");
  }

  if (apiKey.startsWith("prj_")) {
    throw new Error("Vercel 프로젝트 ID가 입력되었습니다. AIza로 시작하는 실제 API 키를 넣어주세요.");
  }

  // 3. 올바른 클래스 및 모델 설정 (gemini-1.5-flash 추천)
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash", 
    generationConfig: {
      responseMimeType: "application/json",
    },
  });
  
  const prompt = `Expert color theorist. Create a 20-color professional palette for: "${keyword}".
    Apply "Warm-Cool Contrast" (한난대비) for professional harmony.
    Exactly 20 unique colors.
    Each color needs 3 style variations: "Natural", "Dramatic", "Surreal". 
    Return in the specified JSON format.`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text(); // 4. response.text()는 함수 호출입니다.

  if (!text) throw new Error("AI로부터 응답을 받지 못했습니다.");

  try {
    return JSON.parse(text) as RecommendationResponse;
  } catch (error) {
    console.error("JSON Parse Error:", text);
    throw new Error("데이터 형식이 올바르지 않습니다. 다시 시도해 주세요.");
  }
};
