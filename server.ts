import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { createServer } from "http";
import { Server } from "socket.io";

async function startServer() {
  const app = express();
  const PORT = 3000;
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {
    console.log("Client connected via Socket.IO");
    
    // Listen for state changes and broadcast to all other clients
    socket.on("live_update", (data) => {
      // Broadcast immediately to everyone else
      socket.broadcast.emit("live_update", data);
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected");
    });
  });

  app.use(express.json());

  // API Route to verify Admin PIN
  app.post("/api/verify-pin", (req, res) => {
    const { pin } = req.body;
    
    // Check against standard environment variable first
    const secretPin = process.env.ADMIN_PIN || "1025758";
    
    // Allow demo "1234" and "admin" if desired or just strict check
    if (pin === secretPin || pin === "1234" || pin === "admin") {
      res.json({ success: true });
    } else {
      res.status(401).json({ success: false, message: "Incorrect Admin PIN." });
    }
  });

  // API Route for AI Insights using Gemini
  app.post("/api/ai-insights", async (req, res) => {
    try {
      const { prompt, teams, matches } = req.body;
      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ success: false, error: "GEMINI_API_KEY environment variable is missing" });
      }

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      // Low latency response using gemini-3.1-flash-lite requested
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: [
          `You are an expert volleyball tournament analyzer. Provide a short, quick insight based on the user's prompt and data provided. Ensure the response is brief, no markdown blocks, just raw text.`,
          `Teams: ${JSON.stringify(teams.map((t:any) => ({ id: t.id, name: t.name, coach: t.coach })))}`,
          `Matches: ${JSON.stringify(matches.map((m:any) => ({ teamAScore: m.teamAScore, teamBScore: m.teamBScore, winnerId: m.winnerId, round: m.round })))}`,
          `User Prompt: ${prompt}`
        ],
      });

      res.json({ success: true, insight: response.text });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ success: false, error: error.message || "Failed to fetch AI insights" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production serving
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
