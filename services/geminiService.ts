import { GoogleGenerativeAI } from "@google/generative-ai";
import { RecommendationResponse } from "./types";

export const generateColorsFromKeyword = async (keyword: string): Promise<RecommendationResponse> => {
  const apiKey = import.meta.env.VITE_API_KEY;
  if (!apiKey) throw new Error("API 키가 설정되지 않았습니다.");

  const genAI = new GoogleGenerativeAI(apiKey);
  
  // Playground(image_3e4407)에서 확인된 사용 가능한 최신 모델명으로 수정합니다.
  const model = genAI.getGenerativeModel({ 
    model: "gemini-3-flash-preview" 
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
    return JSON.parse(text) as RecommendationResponse;
  } catch (error: any) {
    console.error("Gemini 상세 에러:", error);
    // 모델을 찾지 못하는 404 에러 발생 시 안내 문구
    throw new Error("AI 호출에 실패했습니다. 사용 가능한 모델 설정을 확인해주세요.");
  }
};
