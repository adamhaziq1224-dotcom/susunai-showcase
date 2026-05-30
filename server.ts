import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY as string,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // API Routes with exponential backoff & model fallbacks
  app.post("/api/ai/generate", async (req, res) => {
    const { model, contents, config } = req.body;
    
    // Attempt request with retries and a fallback mechanism
    const maxRetries = 3;
    let currentRetry = 0;
    let lastError: any = null;
    let activeModel = model || "gemini-3.5-flash"; // default to highly stable gemini-3.5-flash

    // If request has obsolete gemini-3-flash-preview, substitute with modern gemini-3.5-flash
    if (activeModel === "gemini-3-flash-preview") {
      activeModel = "gemini-3.5-flash";
    }

    while (currentRetry <= maxRetries) {
      try {
        const response = await ai.models.generateContent({
          model: activeModel,
          contents,
          config
        });
        return res.json({ text: response.text, response });
      } catch (error: any) {
        lastError = error;
        console.error(`Gemini API Error (Attempt ${currentRetry + 1}/${maxRetries + 1}):`, error);

        const isOverloadedOrRateLimit = 
          error.status === 429 || 
          error.status === 503 || 
          (error.message && (
            error.message.includes("503") || 
            error.message.includes("high demand") || 
            error.message.includes("ResourceExhausted") ||
            error.message.includes("UNAVAILABLE") ||
            error.message.includes("overloaded")
          ));

        if (isOverloadedOrRateLimit && currentRetry < maxRetries) {
          const delay = Math.pow(2, currentRetry) * 1000;
          console.warn(`Gemini API high demand or 503. Backing off for ${delay}ms...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
          
          // Fallback model to highly available stable gemini-3.5-flash for subsequent retries if not already used
          if (activeModel !== "gemini-3.5-flash") {
            console.log("Switching model to gemini-3.5-flash for failover support.");
            activeModel = "gemini-3.5-flash";
          }
          
          currentRetry++;
        } else {
          break;
        }
      }
    }

    res.status(lastError?.status || 500).json({ 
      error: lastError?.message || "Failed to generate content",
      details: lastError
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
