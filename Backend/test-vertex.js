import dotenv from "dotenv";
dotenv.config();

import { VertexAI } from "@google-cloud/vertexai";

const vertexAI = new VertexAI({
  project: "genai-assistant-471214", // ✅ use correct project ID
  location: "us-central1",    // ✅ keep same region
});
let lastRequestTime = 0;
const REQUEST_DELAY = 5000; // 5 seconds

async function safeGenerate(model, payload) {
  const now = Date.now();
  if (now - lastRequestTime < REQUEST_DELAY) {
    await new Promise((r) => setTimeout(r, REQUEST_DELAY));
  }
  lastRequestTime = Date.now();
  return await model.generateContent(payload);
}

async function quickTest() {
  const model = vertexAI.getGenerativeModel({
    model: "gemini-2.5-flash-lite", // ✅ match Vertex AI Studio
  });

  const result = await model.safeGenerate({
    contents: [{ role: "user", parts: [{ text: "Hello Gemini!" }] }],
  });

  console.log(result.response.candidates[0].content.parts[0].text);
}

quickTest().catch(console.error);
