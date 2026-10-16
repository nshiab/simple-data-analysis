import { Ollama, type ChatRequest } from "ollama";

export default function createGenerationClient(reply: (request: ChatRequest) => string) {
  const requests: ChatRequest[] = [];
  const ollama = new Ollama({ host: "http://unused.local:11434" });
  Object.defineProperty(ollama, "chat", {
    configurable: true,
    value: (request: ChatRequest) => {
      requests.push(request);
      return Promise.resolve({
        message: { role: "assistant", content: reply(request) },
        prompt_eval_count: 1,
        eval_count: 1,
      });
    },
  });
  return { ollama, requests };
}
