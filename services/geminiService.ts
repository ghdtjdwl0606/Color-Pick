import { GoogleGenerativeAI } from "@google/generative-ai";
import { RecommendationResponse } from "./types";

export const generateColorsFromKeyword = async (keyword: string): Promise<RecommendationResponse> => {
  const apiKey = import.meta.env.VITE_API_KEY;
  if (!apiKey) throw new Error("API 키가 설정되지 않았습니다.");

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

  // 응답이 잘리지 않도록 색상 개수를 12개로 조정하고 프롬프트를 간결화합니다.
  const prompt = `Create a 12-color palette for: "${keyword}". 
    Return ONLY JSON: { "recommendations": [{ "color": "hex", "name": "name", "description": "desc", "styles": { "natural": "hex", "dramatic": "hex", "surreal": "hex" } }] }`;

  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        maxOutputTokens: 1000, // 충분한 길이를 확보합니다.
      },
    });

    const response = await result.response;
    let text = response.text();

    // 1. JSON 문자열이 불완전하게 끝났을 경우를 대비한 최소한의 보호 로직
    if (text.includes('"recommendations":') && !text.endsWith(']}')) {
        // 문자열이 잘렸을 경우 수동으로 닫아주어 파싱 에러를 방지합니다.
        text = text.substring(0, text.lastIndexOf('}')) + '}]}';
    }

    try {
      const data = JSON.parse(text);
      return data as RecommendationResponse;
    } catch (parseError) {
      console.error("JSON 파싱 에러 (데이터 일부 손실):", text);
      // 파싱 실패 시 빈 배열을 반환하여 slice 에러를 방지합니다.
      return { recommendations: [] };
    }

  } catch (error: any) {
    console.error("Gemini 호출 에러:", error);
    return { recommendations: [] };
  }
};
