import express from "express";
import fetch from "node-fetch"; // nëse sjell probleme, e heqim
import cors from "cors";

const app = express();
app.use(cors());

app.get("/", (req, res) => {
  res.send("Shqip365 Live API is running...");
});

// example route: /api?url=https://example.com
app.get("/api", async (req, res) => {
  try {
    const url = req.query.url;

    if (!url) {
      return res.status(400).json({ error: "Missing url parameter" });
    }

    const response = await fetch(url);
    const html = await response.text();

    res.send(html);
  } catch (error) {
    console.error("ERROR:", error);
    res.status(500).json({ error: "Server fetch error" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
