
import { GoogleGenAI, Type } from "@google/genai";
import { RecommendationResponse } from "../types";

export const generateColorsFromKeyword = async (keyword: string): Promise<RecommendationResponse> => {
  const apiKey = process.env.API_KEY;
  
  // API 키 유효성 검사 (Vercel 프로젝트 ID나 잘못된 값이 들어오는 경우 방지)
  if (!apiKey || apiKey === "undefined" || apiKey.startsWith("prj_")) {
    throw new Error("Gemini API 키가 올바르게 설정되지 않았습니다. Vercel 환경 변수(API_KEY)에 Google AI Studio에서 발급받은 'AIza...'로 시작하는 키를 입력했는지 확인해주세요.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Expert color theorist. Create a 20-color professional palette for: "${keyword}".
    
    RULES:
    1. Apply "Warm-Cool Contrast" (한난대비) for professional harmony.
    2. Exactly 20 unique colors.
    3. Each color needs 3 style variations:
       - "Natural": Realistic lighting.
       - "Dramatic": Clear high-contrast value shift.
       - "Surreal": Sophisticated artistic color shifts. 
         *SATURATION RULE*: If the base color is highly saturated (vivid), the "Surreal" highlights and shadows MUST be lower-saturation (muted/desaturated) to balance the visual intensity and create a professional look.
    
    JSON SCHEMA:
    {
      "themeName": "Creative Name",
      "colors": [
        {
          "name": "Color Name",
          "base": "#HEX",
          "variations": [
            {"label": "Natural", "highlight": "#HEX", "shadow": "#HEX"},
            {"label": "Dramatic", "highlight": "#HEX", "shadow": "#HEX"},
            {"label": "Surreal", "highlight": "#HEX", "shadow": "#HEX"}
          ],
          "reason": "Short logic"
        }
      ]
    }`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          themeName: { type: Type.STRING },
          colors: {
            type: Type.ARRAY,
            minItems: 20,
            maxItems: 20,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                base: { type: Type.STRING },
                variations: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      label: { type: Type.STRING },
                      highlight: { type: Type.STRING },
                      shadow: { type: Type.STRING }
                    },
                    required: ["label", "highlight", "shadow"]
                  }
                },
                reason: { type: Type.STRING }
              },
              required: ["name", "base", "variations", "reason"]
            }
          }
        },
        required: ["themeName", "colors"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("AI 응답을 생성하지 못했습니다.");

  try {
    return JSON.parse(text) as RecommendationResponse;
  } catch (error) {
    console.error("JSON parse error:", error, text);
    throw new Error("데이터 형식이 올바르지 않습니다. 다시 시도해 주세요.");
  }
};
