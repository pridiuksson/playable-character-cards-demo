# Design Rationale: AI Adapter Pattern

This document explains the "why" behind the AI Adapter Pattern used in the Playable Character Cards architecture.

## The Problem
Directly integrating with a specific AI provider (e.g., Google's Gemini, OpenAI's GPT) creates tight coupling. If you want to switch providers, test a new model, or add a fallback, you have to refactor every part of your application that makes an AI call. This is brittle, time-consuming, and error-prone.

Code that is tightly coupled might look like this:
```typescript
// DON'T DO THIS
import { GoogleGenerativeAI } from "@google/generative-ai";

async function getAiResponse(prompt: string) {
  // Logic is tied directly to the Google SDK
  const genAI = new GoogleGenerativeAI(Deno.env.get("GCP_API_KEY"));
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const result = await model.generateContent(prompt);
  return result.response.text();
}
```

## The Solution: The Adapter Pattern
The Adapter Pattern solves this by creating a layer of abstraction. We define our own, stable interface for a specific task (like `getChatCompletion`), and then create concrete implementations (adapters) for each AI provider that conform to that interface.

### Core Principles
1.  **Define a Stable Interface**: Create a generic interface that captures the *business need*, not the provider's specific API. For chat, this might be a function that accepts a structured prompt and returns a simple string response.
2.  **Isolate Provider Logic**: Each adapter is responsible for all the messy details of its provider:
    *   Authentication (API keys, tokens).
    *   SDK initialization.
    *   Request formatting (transforming our stable interface into the provider's required format).
    *   Response parsing (extracting the useful data from the provider's complex response object).
    *   Error handling and retry logic specific to that provider.
3.  **Dependency Injection**: The business logic (e.g., the `play-turn` Edge Function) doesn't know or care which provider is being used. It simply calls the function from the imported adapter.

### Illustrative Example

**1. The Stable Interface (Our application's view of the world):**
```typescript
// file: /_shared/interfaces/ai_adapter.ts
export interface ChatPrompt {
  systemMessage: string;
  userMessage: string;
}

export interface ChatAdapter {
  getChatCompletion(prompt: ChatPrompt): Promise<string>;
}
```

**2. A Concrete Adapter (Gemini-specific logic):**
```typescript
// file: /_shared/ai_adapters/gemini_adapter.ts
import { ChatAdapter, ChatPrompt } from "../interfaces/ai_adapter.ts";
import { GoogleGenerativeAI } from "@google/generative-ai";

export class GeminiChatAdapter implements ChatAdapter {
  private model;

  constructor(apiKey: string) {
    const genAI = new GoogleGenerativeAI(apiKey);
    this.model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }

  async getChatCompletion(prompt: ChatPrompt): Promise<string> {
    const fullPrompt = `${prompt.systemMessage}\n\n${prompt.userMessage}`;
    const result = await this.model.generateContent(fullPrompt);
    return result.response.text();
  }
}
```

**3. Business Logic (Decoupled and clean):**
```typescript
// file: /functions/play-turn/index.ts
import { GeminiChatAdapter } from "../../_shared/ai_adapters/gemini_adapter.ts";

// In a real app, the adapter would be chosen based on config/env
const apiKey = Deno.env.get("GCP_API_KEY");
const chatAdapter = new GeminiChatAdapter(apiKey);

// ... inside the request handler ...
const aiResponse = await chatAdapter.getChatCompletion({
  systemMessage: card.description,
  userMessage: userMessage,
});
```

## Benefits
-   **Provider Agnosticism**: To switch from Gemini to OpenAI, you simply create an `OpenAIChatAdapter` and change one import statement. The business logic in `play-turn` remains untouched.
-   **Improved Testability**: You can create a `MockChatAdapter` for unit tests that returns predictable responses without making real API calls.
-   **Centralized Control**: All provider-specific configuration, error handling, and retry logic is centralized in one place, making it easier to manage and update.
-   **Resilience**: You can build a "fallback adapter" that tries one provider and, on failure, automatically switches to another.
