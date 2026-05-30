import { tavily } from "@tavily/core";
const tavilyClient = tavily({
  apiKey: process.env.TAVILY_API_KEY,
});

// INTERNET SEARCH FUNCTION
export async function searchinternet({ query }) {
  try {
    const response = await tavilyClient.search(query, {
      maxResults: 5,

      searchDepth: "advanced",
    });

    return JSON.stringify(response.results);
  } catch (error) {
    console.log("Tavily Search Error:", error);

    return "Internet search failed";
  }
}
