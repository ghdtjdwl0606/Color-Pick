
import { GoogleGenAI, Type } from "@google/genai";
import { RecommendationResponse } from "../types";

export const generateColorsFromKeyword = async (keyword: string): Promise<RecommendationResponse> => {
  // process.env.API_KEY가 없는 경우를 대비한 안전한 참조
  const apiKey = typeof process !== 'undefined' ? process.env.API_KEY : undefined;
  
  if (!apiKey || apiKey === "undefined" || apiKey === "") {
    throw new Error("Gemini API_KEY가 설정되지 않았습니다. Vercel 프로젝트 설정(Settings > Environment Variables)에서 'API_KEY'라는 이름으로 실제 Gemini API 키(AIza...로 시작)를 추가해 주세요.");
  }

  // 사용자가 입력한 prj_... 값은 Vercel Project ID이므로 이에 대한 안내 추가
  if (apiKey.startsWith("prj_")) {
    throw new Error(`잘못된 키 형식: '${apiKey.substring(0, 12)}...'는 Vercel 프로젝트 ID입니다. AI 작동을 위해서는 Google AI Studio(https://aistudio.google.com/)에서 발급받은 'AIza'로 시작하는 API 키가 필요합니다.`);
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
  if (!text) throw new Error("AI로부터 응답을 받지 못했습니다.");

  try {
    return JSON.parse(text) as RecommendationResponse;
  } catch (error) {
    throw new Error("데이터 형식이 올바르지 않습니다. 다시 시도해 주세요.");
  }
};
