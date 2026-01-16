import { GoogleGenerativeAI } from "@google/generative-ai";
import { RecommendationResponse } from "./types";

export const generateColorsFromKeyword = async (keyword: string): Promise<RecommendationResponse> => {
  const apiKey = import.meta.env.VITE_API_KEY;
  if (!apiKey) throw new Error("API 키가 설정되지 않았습니다.");

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

  // 프롬프트 수정: description을 아예 빼서 텍스트 길이를 줄입니다. (끊김 방지)
  const prompt = `Create a color palette for: "${keyword}". 
    Return ONLY JSON. 
    Format: { "themeName": "${keyword}", "recommendations": [{ "color": "#HEX", "name": "name", "styles": { "natural": "#HEX", "dramatic": "#HEX", "surreal": "#HEX" } }] }
    Generate max 10 colors.`;

  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        maxOutputTokens: 1000, // 토큰을 적절히 제한
        temperature: 0.2,
      },
    });

    const response = await result.response;
    let text = response.text().trim();

    try {
      // 1. 정상 파싱 시도
      return JSON.parse(text);
    } catch (e) {
      console.log("JSON 끊김 감지, 복구 시도...");
      
      // 2. 끊긴 JSON 복구 로직 (Dirty JSON Repair)
      // 마지막 정상적인 객체 닫기(}) 지점을 찾습니다.
      const lastIndex = text.lastIndexOf('}');
      if (lastIndex !== -1) {
        let fixedText = text.substring(0, lastIndex + 1);
        
        // 구조가 recommendations 배열 내부라면 괄호를 닫아줌
        if (!fixedText.endsWith(']}')) {
          fixedText += ']}';
        }
        // 전체 객체가 안 닫혔다면 닫아줌
        if ((fixedText.match(/{/g) || []).length > (fixedText.match(/}/g) || []).length) {
          fixedText += '}';
        }
        
        try {
          return JSON.parse(fixedText);
        } catch (repairError) {
          console.error("복구 실패:", fixedText);
          throw repairError;
        }
      }
      throw e;
    }
  } catch (error: any) {
    console.error("Gemini 서비스 에러:", error);
    // 에러 발생 시 최소한의 기본값 반환
    return { themeName: keyword, recommendations: [] };
  }
};
