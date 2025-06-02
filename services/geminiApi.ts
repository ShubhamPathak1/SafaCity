import Constants from 'expo-constants';
const {APIKEY} = Constants.expoConfig?.extra;

export const sendToGemini = async (base64Image: string) => {
  const API_KEY = APIKEY;
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;
  

  const payload = {
    contents: [
      {
        parts: [
          {
            text: "Tell the name of this waste. And tell whether it is degradable or non-degradable, in this format: Banana Peel : Biodegradable. Please dont add any other texts.",
          },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image,
            },
          },
        ],
      },
    ],
  };

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const json = await res.json();
  return json?.candidates?.[0]?.content?.parts?.[0]?.text ?? "No response from Gemini.";
};
