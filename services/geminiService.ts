import { GoogleGenerativeAI } from "@google/generative-ai";
import { RecommendationResponse } from "./types";

export const generateColorsFromKeyword = async (keyword: string): Promise<RecommendationResponse> => {
  const apiKey = import.meta.env.VITE_API_KEY;
  if (!apiKey) throw new Error("API 키가 설정되지 않았습니다.");

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

  const prompt = `Create a 10-color palette for: "${keyword}". 
    Return ONLY a valid JSON object. 
    Format: { "themeName": "string", "recommendations": [{ "color": "#HEX", "name": "name", "description": "short", "styles": { "natural": "#HEX", "dramatic": "#HEX", "surreal": "#HEX" } }] }`;

  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        maxOutputTokens: 2000,
        temperature: 0.3, // 온도를 더 낮추어 엄격한 형식을 유도합니다.
      },
    });

    const response = await result.response;
    let text = response.text().trim();

    if (!text) throw new Error("Empty response");

    try {
      // 해결책 1: JSON 외부에 붙은 불필요한 텍스트나 중복 괄호 제거
      // 가장 처음 등장하는 { 부터 마지막 } 까지만 추출합니다.
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        text = jsonMatch[0];
      }

      // 해결책 2: 중복 닫기 괄호 방어 로직
      // 만약 정규식으로도 해결 안 될 정도로 괄호가 꼬였다면 수동 처리
      let openBraces = 0;
      let cutIndex = -1;
      for (let i = 0; i < text.length; i++) {
        if (text[i] === '{') openBraces++;
        if (text[i] === '}') openBraces--;
        if (openBraces === 0 && cutIndex === -1) {
          cutIndex = i; // 첫 번째 완벽한 객체가 닫히는 지점 저장
          break;
        }
      }
      if (cutIndex !== -1) {
        text = text.substring(0, cutIndex + 1);
      }

      return JSON.parse(text) as RecommendationResponse;
    } catch (parseError) {
      console.error("보정 후에도 파싱 실패:", text);
      throw parseError;
    }
  } catch (error: any) {
    console.error("Gemini 서비스 에러:", error);
    return { themeName: keyword, recommendations: [] };
  }
};
