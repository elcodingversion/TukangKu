import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// Helper function to handle Gemini standard calls with automatic retries for transient failures (503, 429)
async function generateContentWithRetry(params: { model: string; contents: any; config?: any }, retries = 3, initialDelayMs = 1000) {
  let delay = initialDelayMs;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await genAI.models.generateContent(params);
    } catch (error: any) {
      console.warn(`[Gemini API] Attempt ${attempt}/${retries} failed:`, error?.message || error);
      
      const errorStr = typeof error === 'string' ? error : (error?.message || JSON.stringify(error) || '');
      const isTransient = 
        error?.status === 503 ||
        error?.statusCode === 503 ||
        errorStr.includes("503") ||
        errorStr.includes("UNAVAILABLE") ||
        error?.status === 429 ||
        error?.statusCode === 429 ||
        errorStr.includes("429") ||
        errorStr.toLowerCase().includes("high demand") ||
        errorStr.toLowerCase().includes("temporary") ||
        errorStr.toLowerCase().includes("resource exhausted") ||
        errorStr.toLowerCase().includes("busy");

      if (isTransient && attempt < retries) {
        console.log(`[Gemini API] Transient error detected. Retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
        continue;
      }
      throw error;
    }
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // API Routes
  app.post("/api/diagnose", async (req, res) => {
    try {
      const { image, prompt } = req.body;

      const response = await generateContentWithRetry({
        model: "gemini-3.5-flash",
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inlineData: {
                  data: image.split(",")[1],
                  mimeType: "image/jpeg",
                },
              },
            ],
          },
        ],
      });

      res.json({ analysis: response?.text || "" });
    } catch (error: any) {
      console.error("Diagnosis error details:", error);
      const errorMsg = error?.message || "";
      if (errorMsg.includes("high demand") || errorMsg.includes("503") || errorMsg.includes("UNAVAILABLE")) {
        res.status(503).json({ 
          error: "Model Gemini sedang sibuk karena permintaan tinggi. Silakan coba sesaat lagi.",
          details: errorMsg
        });
      } else {
        res.status(500).json({ error: "Gagal mendiagnosis gambar." });
      }
    }
  });

  app.post("/api/generate", async (req, res) => {
    try {
      const { prompt } = req.body;
      const response = await generateContentWithRetry({
        model: "gemini-3.5-flash",
        contents: prompt,
      });

      res.json({ result: response?.text || "" });
    } catch (error: any) {
      console.error("Generation error details:", error);
      const errorMsg = error?.message || "";
      if (errorMsg.includes("high demand") || errorMsg.includes("503") || errorMsg.includes("UNAVAILABLE")) {
        res.status(503).json({ 
          error: "Model Gemini sedang sibuk karena permintaan tinggi. Silakan coba sesaat lagi.",
          details: errorMsg
        });
      } else {
        res.status(500).json({ error: "Gagal memproses pembuatan solusi." });
      }
    }
  });

  // Vite integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
