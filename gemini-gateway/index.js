import express from "express";
import { VertexAI } from "@google-cloud/vertexai";

const app = express();

app.use(express.json({ limit: "10mb" }));

const PROJECT_ID = "talentbuzz-ai-prod";
const LOCATION = "us-central1";

const vertex_ai = new VertexAI({
  project: PROJECT_ID,
  location: LOCATION,
});

const model = vertex_ai.getGenerativeModel({
  model: "gemini-2.5-flash",
});

app.get("/", async (req, res) => {
  res.json({
    ok: true,
    service: "TalentBuzz Gemini Gateway",
  });
});

app.post("/generate", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({
        ok: false,
        error: "Prompt required",
      });
    }

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
    });

    const response = result.response;
    const text = response.candidates?.[0]?.content?.parts?.[0]?.text || "";

    return res.json({
      ok: true,
      text,
    });
  } catch (error) {
    console.error("Vertex error:", error);

    return res.status(500).json({
      ok: false,
      error: error.message,
    });
  }
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`TalentBuzz Gemini Gateway running on port ${PORT}`);
});
