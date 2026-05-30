import OpenAI from "openai";
import { tool } from "langchain/tools";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
import * as z from "zod";

import { searchinternet } from "./internet.services.js";

// MODEL
const model = new ChatOpenAI({
  model: "openai/gpt-4.1-mini",

  temperature: 0.7,

  maxTokens: 500,

  apiKey: process.env.OPENROUTER_API_KEY,

  configuration: {
    baseURL: "https://openrouter.ai/api/v1",
  },
});

// INTERNET TOOL
const searchinternettool = tool(searchinternet, {
  name: "searchInternet",

  description: `
Search realtime and latest information from the internet.

Use this tool whenever information may be:
- current
- live
- recent
- changing over time

Examples:
- gold price
- stock market
- IPL score
- weather
- latest news
- crypto prices
- sports results
- realtime events

IMPORTANT:
Use previous conversation context while searching.
If user asks follow-up questions like:
- "india"
- "today"
- "what about mumbai"

then combine previous messages automatically.
  `,

  schema: z.object({
    query: z.string().describe("Search query"),
  }),
});

// AGENT
const agent = createReactAgent({
  llm: model,

  tools: [searchinternettool],
});

// GENERATE RESPONSE
export async function generateResponse(messages) {
  try {
    // FORMAT FULL CHAT HISTORY
    const formattedMessages = messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    // SYSTEM MESSAGE
    const systemMessage = {
      role: "system",

      content: `
You are a smart AI assistant.

RULES:

1. Always remember previous conversation context.

2. Understand follow-up questions naturally.

Example:
User: gold price
Assistant: Which country?
User: india

Meaning:
gold price in India.

3. Use internet search whenever realtime/current/latest information is needed.

4. Never make up realtime information.

5. Keep responses concise and accurate.
      `,
    };

    // AGENT RESPONSE
    const response = await agent.invoke({
      messages: [
        systemMessage,

        ...formattedMessages,
      ],
    });

    // FINAL MESSAGE
    const finalMessage =
      response.messages[response.messages.length - 1];

    return finalMessage.content;
  } catch (error) {
    console.log("AI ERROR:", error);

    throw new Error(error.message || "AI service unavailable");
  }
}

// GENERATE TITLE
export async function generateTitle(userMessage, aiMessage) {
  try {
    const client = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",

      apiKey: process.env.OPENROUTER_API_KEY,
    });

    const completion = await client.chat.completions.create({
      model: "openai/gpt-4.1-mini",

      messages: [
        {
          role: "system",

          content: `
Generate ONLY a short accurate chat title.

Rules:
- Maximum 5 words
- Use conversation topic
- Do not generate full sentences
- Do not invent facts
- Keep it clean and concise

Examples:
- West Bengal CM
- Gold Price India
- IPL Final Score
- Weather in Delhi
          `,
        },

        {
          role: "user",

          content: `
User Message:
${userMessage}

Assistant Response:
${aiMessage}
          `,
        },
      ],

      max_tokens: 20,

      temperature: 0.2,
    });

    return (
      completion?.choices?.[0]?.message?.content
        ?.trim()
        ?.replace(/["']/g, "") || "New Chat"
    );
  } catch (error) {
    console.log("TITLE ERROR:", error);

    return "New Chat";
  }
}