
import { GoogleGenAI, Type } from "@google/genai";
import { RecommendationResponse } from "../types";

export const generateColorsFromKeyword = async (keyword: string): Promise<RecommendationResponse> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
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
