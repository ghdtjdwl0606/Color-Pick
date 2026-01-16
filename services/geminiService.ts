import { GoogleGenerativeAI } from "@google/generative-ai";
import { RecommendationResponse } from "./types";

export const generateColorsFromKeyword = async (keyword: string): Promise<RecommendationResponse> => {
  const apiKey = import.meta.env.VITE_API_KEY;
  if (!apiKey) throw new Error("API 키가 설정되지 않았습니다.");

  const genAI = new GoogleGenerativeAI(apiKey);
  // 모델을 gemini-3-flash-preview로 유지합니다.
  const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

  // 1. 개수를 10개로 줄이고 설명을 간결하게 하여 데이터 유실을 방지합니다.
  const prompt = `Create a 10-color palette for: "${keyword}". 
    Return ONLY valid JSON.
    Format: { "themeName": "string", "recommendations": [{ "color": "#HEX", "name": "name", "description": "short", "styles": { "natural": "#HEX", "dramatic": "#HEX", "surreal": "#HEX" } }] }`;

  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        maxOutputTokens: 2000, 
        temperature: 0.5,      // 일관성 있는 응답을 유도합니다.
      },
    });

    const response = await result.response;
    let text = response.text();

    if (!text) throw new Error("Empty response");

    try {
      // 2. 만약 JSON이 끊겼을 경우(Unterminated string)를 위한 자동 보정 로직
      if (text.includes('"recommendations":') && !text.endsWith(']}')) {
        // 마지막으로 정상적으로 끝난 } 이후를 찾아 강제로 닫아줍니다.
        const lastBrace = text.lastIndexOf('}');
        if (lastBrace !== -1) {
          text = text.substring(0, lastBrace + 1);
          if (!text.endsWith(']')) text += ']';
          if (!text.endsWith('}')) text += '}';
        }
      }
      
      return JSON.parse(text) as RecommendationResponse;
    } catch (parseError) {
      console.error("JSON 파싱 에러 발생:", parseError, "데이터 원본:", text);
      return { themeName: keyword, recommendations: [] };
    }
  } catch (error: any) {
    console.error("Gemini 서비스 에러:", error);
    return { themeName: keyword, recommendations: [] };
  }
};
