import Constants from 'expo-constants';

const { APIKEY } = Constants.expoConfig?.extra;

export const askGemini = async (userMessage: string): Promise<string> => {
  const apiKey = APIKEY;
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  const systemPrompt = `You are WasteBot, a helpful assistant that only answers questions related to waste management, recycling, disposal methods, environmental sustainability, throwing something in dustbins, composting, dumping, etc. and eco-friendly practices.

If a question is outside of this domain (like sports, finance, movies, etc.), politely say:
"I'm focused only on waste and recycling. Please ask me something in that area."

However, try your best to interpret unclear or casual questions that might still relate to waste (e.g., 'where to throw fruiti cans', 'can I recycle wrappers', etc.).

Always be clear, friendly, and concise. Use markdown-style formatting for emphasis.`;

  const body = {
    contents: [
      {
        role: "user",
        parts: [{ text: `${systemPrompt}\n\nUser: ${userMessage}` }],
      },
    ],
  };

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const json = await response.json();
    return (
      json?.candidates?.[0]?.content?.parts?.[0]?.text ??
      "No response from Gemini."
    );
  } catch (error) {
    console.error("Gemini API error:", error);
    return "Something went wrong. Please try again.";
  }
};
