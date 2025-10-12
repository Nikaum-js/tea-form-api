interface DeepSeekMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface DeepSeekResponse {
  id: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class DeepSeekService {
  private apiKey: string;
  private baseUrl = "https://api.deepseek.com/v1";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async chat(messages: DeepSeekMessage[], maxTokens?: number): Promise<string> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 120000); // 2min timeout

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages,
          temperature: 0.7,
          ...(maxTokens && { max_tokens: maxTokens }),
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `DeepSeek API error: ${response.status} - ${errorText}`
        );
      }

      const data: DeepSeekResponse = await response.json();
      return data.choices[0]?.message?.content || "";
    } finally {
      clearTimeout(timeout);
    }
  }
}
