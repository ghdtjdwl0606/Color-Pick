import { GoogleGenerativeAI } from "@google/generative-ai";
import { RecommendationResponse } from "./types";

export const generateColorsFromKeyword = async (keyword: string): Promise<RecommendationResponse> => {
  const apiKey = import.meta.env.VITE_API_KEY;
  if (!apiKey) throw new Error("API 키가 설정되지 않았습니다.");

  const genAI = new GoogleGenerativeAI(apiKey);
  
  // Playground에서 확인된 최신 모델 사용
  const model = genAI.getGenerativeModel({ 
    model: "gemini-3-flash-preview" 
  });

  // AI에게 응답 형식을 더 구체적으로 지시합니다.
  const prompt = `Expert color theorist. Create a 20-color professional palette for: "${keyword}".
    Apply "Warm-Cool Contrast" (한난대비) for professional harmony.
    Exactly 20 unique colors.
    Return ONLY a JSON object with this exact structure:
    {
      "recommendations": [
        {
          "color": "#HEXCODE",
          "name": "color name",
          "description": "brief description",
          "styles": {
            "natural": "#HEXCODE",
            "dramatic": "#HEXCODE",
            "surreal": "#HEXCODE"
          }
        }
      ]
    }`;

  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const response = await result.response;
    const text = response.text();
    
    // 데이터 파싱 및 안전한 반환
    const data = JSON.parse(text);
    
    // 만약 recommendations가 없다면 빈 배열이라도 넣어서 .slice 에러를 방지합니다.
    if (!data.recommendations) {
      return { recommendations: [] } as RecommendationResponse;
    }

    return data as RecommendationResponse;
  } catch (error: any) {
    console.error("Gemini 상세 에러:", error);
    throw new Error("데이터를 처리하는 도중 오류가 발생했습니다.");
  }
};
