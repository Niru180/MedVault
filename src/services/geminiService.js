import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const chatWithHealtheu = async (message, history = []) => {
  try {
    const model = ai.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: `You are Healtheu, a state-of-the-art medical AI assistant integrated into the MedVault platform. 
        Your persona: Professional, compassionate, evidence-based, and highly reliable.
        Your goals:
        1. Help patients understand their health metrics and medical records.
        2. Provide general wellness advice, preventative care tips, and explanation of medical terminology.
        3. Support doctors by synthesizing general medical knowledge (do NOT diagnose specifically, but suggest possibilities to discuss with a clinician).
        
        Strict Guidelines:
        - ALWAYS add: "Disclaimer: I am an AI, not a doctor. Please consult a qualified healthcare professional for medical diagnosis or treatment."
        - If a user describes a life-threatening symptom (chest pain, stroke symptoms, major trauma), IMMEDIATELY advise them to call emergency services.
        - Keep responses concise and formatted for readability (use bullet points if needed).
        - Use a warm, reassuring tone.`
    });

    const chat = model.startChat({
        history: history.map(h => ({
            role: h.role === 'user' ? 'user' : 'model',
            parts: [{ text: h.text }]
        })),
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini Error:", error);
    return "I'm sorry, I'm having trouble connecting to my medical database right now. Please try again in a moment.";
  }
};
