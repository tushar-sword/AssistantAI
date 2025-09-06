import dotenv from "dotenv";
dotenv.config();

import { VertexAI } from "@google-cloud/vertexai";

const vertexAI = new VertexAI({
  project: "genai-assistant-471214", // ✅ use correct project ID
  location: "us-central1",    // ✅ keep same region
});

async function quickTest() {
  const model = vertexAI.getGenerativeModel({
    model: "gemini-2.5-flash-lite", // ✅ match Vertex AI Studio
  });

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: "Hello Gemini!" }] }],
  });

  console.log(result.response.candidates[0].content.parts[0].text);
}

quickTest().catch(console.error);
