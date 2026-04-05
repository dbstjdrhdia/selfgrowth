import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use /tmp for serverless/read-only filesystem compatibility when deployed
const isDeployed = fs.existsSync(path.join(process.cwd(), "dist"));
const DATA_FILE = isDeployed 
  ? "/tmp/data.json" 
  : path.join(__dirname, "data.json");

// Initial data structure
const initialData = {
  posts: [
    {
      id: "1",
      title: "MBTI로 알아보는 나의 핵심 감정",
      content: "MBTI 유형별로 스트레스 상황에서 나타나는 핵심 감정의 차이를 알아봅니다...",
      category: "칼럼",
      createdAt: new Date().toISOString(),
    },
    {
      id: "2",
      title: "6주간의 자아성장 프로그램 후기",
      content: "프로그램을 통해 나 자신을 더 깊이 이해하게 된 소중한 시간이었습니다.",
      category: "공지사항",
      createdAt: new Date().toISOString(),
    }
  ],
  applications: [],
  settings: {
    siteName: "자아성장연구소",
    primaryColor: "#B5B2D2",
    heroTitle: "나를 찾는 여정, 자아성장연구소",
    heroSubtitle: "20대 청년들을 위한 MBTI 기반 심리 성장 프로그램",
  }
};

// Initialize data file if not exists
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
}

function readData() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      console.log(`Data file not found at ${DATA_FILE}, creating it...`);
      fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
    }
    const rawData = fs.readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(rawData);
  } catch (error) {
    console.error("Error reading data:", error);
    return initialData; // Fallback to initial data if reading fails
  }
}

function writeData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error writing data:", error);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/data", (req, res) => {
    try {
      const data = readData();
      res.json(data);
    } catch (error) {
      console.error("API /api/data error:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  app.post("/api/posts", (req, res) => {
    const data = readData();
    const newPost = { ...req.body, id: Date.now().toString(), createdAt: new Date().toISOString() };
    data.posts.unshift(newPost);
    writeData(data);
    res.json(newPost);
  });

  app.put("/api/posts/:id", (req, res) => {
    const data = readData();
    const index = data.posts.findIndex((p) => p.id === req.params.id);
    if (index !== -1) {
      data.posts[index] = { ...data.posts[index], ...req.body };
      writeData(data);
      res.json(data.posts[index]);
    } else {
      res.status(404).json({ error: "Post not found" });
    }
  });

  app.delete("/api/posts/:id", (req, res) => {
    const data = readData();
    data.posts = data.posts.filter((p) => p.id !== req.params.id);
    writeData(data);
    res.json({ success: true });
  });

  app.post("/api/applications", (req, res) => {
    const data = readData();
    const newApp = { ...req.body, id: Date.now().toString(), status: "대기", createdAt: new Date().toISOString() };
    data.applications.unshift(newApp);
    writeData(data);
    res.json(newApp);
  });

  app.patch("/api/applications/:id", (req, res) => {
    const data = readData();
    const index = data.applications.findIndex((a) => a.id === req.params.id);
    if (index !== -1) {
      data.applications[index].status = req.body.status;
      writeData(data);
      res.json(data.applications[index]);
    } else {
      res.status(404).json({ error: "Application not found" });
    }
  });

  app.post("/api/settings", (req, res) => {
    const data = readData();
    data.settings = { ...data.settings, ...req.body };
    writeData(data);
    res.json(data.settings);
  });

  // Serve static files if 'dist' exists (production), otherwise use Vite middleware
  const distPath = path.join(process.cwd(), "dist");
  if (fs.existsSync(distPath)) {
    console.log("Serving static files from dist...");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  } else {
    console.log("Starting Vite middleware for development...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
