import { GoogleGenerativeAI } from "@google/generative-ai";
import { RecommendationResponse } from "./types";

export const generateColorsFromKeyword = async (keyword: string): Promise<RecommendationResponse> => {
  const apiKey = import.meta.env.VITE_API_KEY;
  if (!apiKey) throw new Error("API 키가 설정되지 않았습니다.");

  const genAI = new GoogleGenerativeAI(apiKey);
  // 모델명: gemini-3-flash-preview 유지
  const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

  const prompt = `Create a 5-color palette for: "${keyword}". 
    Return ONLY a valid JSON object. 
    Format: { 
      "themeName": "${keyword}", 
      "recommendations": [
        { "color": "#HEX", "name": "Name", "styles": { "natural": "#HEX", "dramatic": "#HEX", "surreal": "#HEX" } }
      ] 
    }
    Generate exactly 5 colors. No descriptions.`;

  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        maxOutputTokens: 800,
        temperature: 0.1,
      },
    });

    const response = await result.response;
    let text = response.text().trim();
    text = text.replace(/```json|```/g, "").trim();

    try {
      return JSON.parse(text) as RecommendationResponse;
    } catch (parseError) {
      // 복구 로직: 문법 에러가 나지 않도록 완전한 형태로 작성됨
      let repairedText = text;
      if (!repairedText.endsWith("}")) {
        const lastBraceIndex = repairedText.lastIndexOf('}');
        if (lastBraceIndex !== -1) {
          repairedText = repairedText.substring(0, lastBraceIndex + 1);
          if (!repairedText.endsWith(']}')) repairedText += ']}';
          if (!repairedText.endsWith('}')) repairedText += '}';
        }
      }
      return JSON.parse(repairedText) as RecommendationResponse;
    }
  } catch (error: any) {
    console.error("Gemini 서비스 에러:", error);
    return { themeName: keyword, recommendations: [] };
  }
};
