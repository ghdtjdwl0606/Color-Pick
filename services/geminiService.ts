import { GoogleGenerativeAI } from "@google/generative-ai";
import { RecommendationResponse } from "./types";

export const generateColorsFromKeyword = async (keyword: string): Promise<RecommendationResponse> => {
  const apiKey = import.meta.env.VITE_API_KEY;
  if (!apiKey) throw new Error("API 키가 설정되지 않았습니다.");

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

  // 1. 프롬프트를 더 단순하게, 예시를 명확하게 제공합니다.
  const prompt = `Task: Create a color palette for "${keyword}".
    Return ONLY JSON in this exact structure:
    {
      "themeName": "${keyword}",
      "recommendations": [
        { "color": "#HEX", "name": "ColorName", "styles": { "natural": "#HEX", "dramatic": "#HEX", "surreal": "#HEX" } }
      ]
    }
    Provide 8 colors max. No descriptions.`;

  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        // responseMimeType을 제거하거나 text로 받은 뒤 수동 파싱하는 것이 때로는 더 안전합니다.
        temperature: 0.1, // 창의성을 최소화하여 형식 준수율을 높임
        maxOutputTokens: 800,
      },
    });

    const response = await result.response;
    let text = response.text().trim();

    // 2. Markdown 코드 블록 제거 (혹시 포함될 경우)
    text = text.replace(/```json|```/g, "").trim();

    try {
      // 3. 정규식을 이용한 불완전 JSON 복구
      // 텍스트가 { 로 시작하지 않으면 찾아서 자름
      const firstBrace = text.indexOf('{');
      const lastBrace = text.lastIndexOf('}');
      
      if (firstBrace !== -1 && lastBrace !== -1) {
        text = text.substring(firstBrace, lastBrace + 1);
      }

      // 4. 파싱 시도
      return JSON.parse(text);
    } catch (e) {
      // 5. 최후의 수단: 배열이 닫히지 않았을 때 강제로 닫기 시도
      try {
        let repaired = text;
        if (!repaired.endsWith("}")) repaired += "}";
        if (!repaired.includes("]}")) repaired = repaired.replace(/}$/, "]}");
        if (!repaired.includes('"}')) repaired = repaired.replace(/$/, '"}'); // 끊긴 문자열 처리 시도
        
        // 정규식으로 대략적인 객체 형태만 추출 시도 (비상용)
        const match = text.match(/\{.*"recommendations":\s*\[.*\]\}/s);
        if (match) return JSON.parse(match[0]);
        
        return JSON.parse(repaired);
      } catch (finalError) {
        console.error("복구 불가능한 JSON 상태:", text);
        throw finalError;
      }
    }
  } catch (error: any) {
    console.error("Gemini 서비스 에러:", error);
    // 앱이 죽지 않도록 기본 구조 반환
    return { themeName: keyword, recommendations: [] };
  }
};
