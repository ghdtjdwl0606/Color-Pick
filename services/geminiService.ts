import { GoogleGenerativeAI } from "@google/generative-ai";
import { RecommendationResponse } from "./types";

export const generateColorsFromKeyword = async (keyword: string): Promise<RecommendationResponse> => {
  const apiKey = import.meta.env.VITE_API_KEY;
  if (!apiKey) throw new Error("API 키가 설정되지 않았습니다.");

  const genAI = new GoogleGenerativeAI(apiKey);
  // 모델 유지
  const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

  /**
   * 1. 개수를 5개로 제한
   * 2. description을 제거하여 출력 길이 최소화
   * 3. 일관된 JSON 형식을 위해 예시 구조 명시
   */
  const prompt = `Create a 5-color palette for: "${keyword}". 
    Return ONLY a valid JSON object. 
    Format: { 
      "themeName": "${keyword}", 
      "recommendations": [
        { "color": "#HEX", "name": "Name", "styles": { "natural": "#HEX", "dramatic": "#HEX", "surreal": "#HEX" } }
      ] 
    }
    Generate exactly 5 colors. Do not include any descriptions or extra text.`;

  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        maxOutputTokens: 600, // 출력 길이를 더 타이트하게 제한
        temperature: 0.1,      // 가장 안정적인 결과 유도
      },
    });

    const response = await result.response;
    let text = response.text().trim();

    // Markdown 코드 블록이 섞여 나올 경우를 대비한 정규식 제거
    text = text.replace(/```json|```/g, "").trim();

    try {
      return JSON.parse(text) as RecommendationResponse;
    } catch (parseError) {
      console.log("JSON 파싱 에러 발생, 수동 복구 시도...");
      
      // 괄호가 덜 닫혔을 경우를 위한 최소한의 안전장치
      let repairedText = text;
      if (!repairedText.endsWith("}")) {
        const lastBr
