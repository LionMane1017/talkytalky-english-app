import { GoogleGenerativeAI, ChatSession, GenerationConfig } from "@google/generative-ai";

export class GeminiLiveSession {
  private model: any;
  private chatSession: ChatSession | null = null;
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    const genAI = new GoogleGenerativeAI(this.apiKey);
    // Using flash for lower latency in conversation
    this.model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }

  /**
   * Starts a new chat session with the given system instruction.
   */
  async startSession(systemInstruction: string) {
    try {
      // We simulate a system instruction by seeding the history
      this.chatSession = this.model.startChat({
        history: [
          {
            role: "user",
            parts: [{ text: `SYSTEM INSTRUCTION: ${systemInstruction}` }],
          },
          {
            role: "model",
            parts: [{ text: "Understood. I am ready to act as the TalkyTalky English coach based on these instructions." }],
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 1000,
        } as GenerationConfig,
      });

      return this.chatSession;
    } catch (error) {
      console.error("Failed to start Gemini session:", error);
      throw error;
    }
  }

  /**
   * Sends a user message to the model and gets the response.
   */
  async sendMessage(message: string): Promise<string> {
    if (!this.chatSession) {
      throw new Error("Session not started. Call startSession() first.");
    }

    try {
      const result = await this.chatSession.sendMessage(message);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error("Error sending message to Gemini:", error);
      throw error;
    }
  }
}
