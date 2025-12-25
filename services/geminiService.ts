
import { GoogleGenAI, Type } from "@google/genai";

export async function analyzeRegistrationTrends(csvData: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `作为资深活动策划专家，请分析以下报名数据，并提供一份简洁的物流需求总结（包括T恤尺码统计、拼车缺口分析、饮食习惯分布）。请使用中文回答：\n\n${csvData}`,
    config: {
      temperature: 0.7,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING, description: "物流需求总体总结" },
          keyInsights: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "关键洞察点，如拼车是否平衡"
          }
        },
        required: ["summary", "keyInsights"]
      }
    },
  });

  try {
    return JSON.parse(response.text);
  } catch (e) {
    return { summary: response.text, keyInsights: [] };
  }
}
