// services/geminiApi.ts (or .js)

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
            text: `Analyze the provided image of waste.
            Your response must be a JSON object conforming to the following structure.
            Return ONLY the JSON object, with no additional text, explanation, or markdown code blocks (e.g., no \`\`\`json\`\`\` or \`\`\` delimiters).

            {
              "waste_type": "electronic/organic/plastic/metal/glass/Or any other type",
              "name": "string",
              "should_be_burned": "Yes/No",
              "reason_for_not_burning": "string",
              "biodegradable": "Yes/No",
              "recyclable": "Yes/No",
              "reusable": "Yes/No",
              "notes": "string"
            }

            Fill in the values based on the image content. If a value cannot be determined, use "N/A".`,
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

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const jsonResponse = await res.json();

    if (jsonResponse.error) {
      console.error("Gemini API Error:", jsonResponse.error.message);
      return { error: `Error from Gemini: ${jsonResponse.error.message}` };
    }

    const geminiTextOutput = jsonResponse?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (geminiTextOutput) {
      // --- START OF FIX ---
      // Remove markdown code block delimiters if present
      let cleanJsonString = geminiTextOutput.replace(/```json\n?/, '').replace(/\n?```/, '');
      cleanJsonString = cleanJsonString.trim(); // Trim any leading/trailing whitespace

      // Sometimes, if the response starts with a newline after the ```json,
      // and ends with one before ```, these replace operations handle it.
      // Also, Gemini might sometimes return extra newlines or spaces.
      // Using .trim() is good practice.

      // --- END OF FIX ---

      try {
        const parsedData = JSON.parse(cleanJsonString); // Parse the cleaned string
        return parsedData;
      } catch (parseError) {
        console.error("Failed to parse JSON from Gemini response:", parseError);
        console.log("Raw Gemini text output:", geminiTextOutput); // Keep this for debugging the raw output
        console.log("Cleaned JSON string (attempted parse):", cleanJsonString); // Add this for debugging
        return { error: "Failed to parse Gemini response as JSON", raw: geminiTextOutput, cleaned: cleanJsonString };
      }
    } else {
      return { error: "No valid text content found in Gemini response.", raw: jsonResponse };
    }
  } catch (fetchError) {
    console.error("Error during API call to Gemini:", fetchError);
    return { error: `Network or API call error: ${fetchError.message}` };
  }
};