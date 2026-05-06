# Full-Stack Integration Guide

> For developers who have both a frontend and a backend (Next.js, React + Node, Vue + Express, etc.)

---

## Overview

In full-stack mode:
- Your **backend** holds the HP API key (never exposed to the browser)
- Your **backend** generates short-lived session tokens (1hr JWT)
- Your **frontend** uses the SDK with those tokens
- The SDK sends requests to your backend proxy, which forwards to HP

```
Browser (SDK) → Your Backend Proxy → HP AI
```

---

## Step 1 — Install the SDK

```bash
npm install @gennoctua/personalize-core
```

---

## Step 2 — Backend Setup

### 2a. Store your API key
Add to your `.env` file:
```
HP_API_KEY=your_hyperpersona_api_key_here
JWT_SECRET=your_random_secret_here_min_32_chars
```

### 2b. Install backend dependencies
```bash
npm install jsonwebtoken
```

### 2c. Add token endpoint
This generates a short-lived JWT for each user session.

**Node/Express:**
```js
const jwt = require("jsonwebtoken");

app.post("/auth/tryon-token", (req, res) => {
  // Optional: check if user is authenticated first
  // if (!req.session.userId) return res.status(401).json({ error: "Unauthorized" });

  const token = jwt.sign(
    { purpose: "tryon", iat: Date.now() },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  res.json({ token, expiresIn: 3600 });
});
```

**Next.js API Route (`/pages/api/auth/tryon-token.js`):**
```js
import jwt from "jsonwebtoken";

export default function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const token = jwt.sign(
    { purpose: "tryon" },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  res.json({ token, expiresIn: 3600 });
}
```

### 2d. Add proxy endpoints

**Node/Express:**
```js
const jwt = require("jsonwebtoken");
const fetch = require("node-fetch"); // or use built-in fetch (Node 18+)

const HP_BASE = "https://hyperpersona-api-914497143112.us-central1.run.app";

// Middleware to validate JWT
function requireTryonToken(req, res, next) {
  const auth = req.headers.authorization || "";
  const token = auth.replace("Bearer ", "");
  try {
    jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

// Submit try-on job
app.post("/api/tryon/submit", requireTryonToken, async (req, res) => {
  try {
    const response = await fetch(`${HP_BASE}/api/tryon/submit`, {
      method: "POST",
      headers: { "X-API-Key": process.env.HP_API_KEY },
      body: req, // pipe the multipart form data
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(502).json({ error: "Upstream error" });
  }
});

// Stream try-on status (SSE)
app.get("/api/tryon/status/:jobId", requireTryonToken, async (req, res) => {
  const { jobId } = req.params;

  const response = await fetch(`${HP_BASE}/api/tryon/status/${jobId}`, {
    headers: { "X-API-Key": process.env.HP_API_KEY },
  });

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  response.body.pipe(res);
});
```

**Next.js API Route — Submit (`/pages/api/tryon/submit.js`):**
```js
import jwt from "jsonwebtoken";

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  // Validate token
  const token = (req.headers.authorization || "").replace("Bearer ", "");
  try {
    jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }

  // Forward to HP
  const response = await fetch(
    "https://hyperpersona-api-914497143112.us-central1.run.app/api/tryon/submit",
    {
      method: "POST",
      headers: {
        "X-API-Key": process.env.HP_API_KEY,
        "Content-Type": req.headers["content-type"],
      },
      body: req,
      duplex: "half",
    }
  );

  const data = await response.json();
  res.json(data);
}
```

**Next.js API Route — Status (`/pages/api/tryon/status/[jobId].js`):**
```js
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  const token = (req.headers.authorization || "").replace("Bearer ", "");
  try {
    jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }

  const { jobId } = req.query;
  const response = await fetch(
    `https://hyperpersona-api-914497143112.us-central1.run.app/api/tryon/status/${jobId}`,
    { headers: { "X-API-Key": process.env.HP_API_KEY } }
  );

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");

  const reader = response.body.getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    res.write(value);
  }
  res.end();
}
```

---

## Step 3 — Frontend Setup

```ts
import { Personalize } from "@gennoctua/personalize-core";

const sdk = await Personalize.init({
  auth: {
    proxyUrl: "/api/tryon",           // your backend proxy URL
    getToken: async () => {
      const res = await fetch("/auth/tryon-token", { method: "POST" });
      const data = await res.json();
      return data.token;
    }
  },
  analytics: {
    onEvent: (event) => console.log("[tryon]", event.eventName)
  }
});
```

---

## Step 4 — Add Upload UI

```html
<input id="photoInput" type="file" multiple accept="image/*" webkitdirectory />
<div id="uploadStatus"></div>
```

```ts
document.getElementById("photoInput").addEventListener("change", async (e) => {
  const statusEl = document.getElementById("uploadStatus");
  statusEl.textContent = "Processing photos...";

  const summary = await sdk.ingestImages(e.target.files, (progress) => {
    statusEl.textContent = progress.message;
  });

  if (summary.availableCategories.length > 0) {
    statusEl.textContent = `Ready! ${summary.totalSelected} profile(s) selected.`;
    document.getElementById("tryOnBtn").disabled = false;
  } else {
    statusEl.textContent = "No usable photos found. Please upload clear face photos.";
  }
});
```

---

## Step 5 — Add Try On Button

```html
<button id="tryOnBtn" disabled>Try On</button>
<img id="resultImage" style="display:none" />
<div id="tryOnStatus"></div>
```

```ts
document.getElementById("tryOnBtn").addEventListener("click", async () => {
  const statusEl = document.getElementById("tryOnStatus");
  const resultEl = document.getElementById("resultImage");

  statusEl.textContent = "Generating your try-on...";

  try {
    const result = await sdk.personalize({
      imageUrl: "https://yourbrand.com/product.jpg",
      productType: "sunglasses",
      productId: "sku-123"
    });

    resultEl.src = result.imageUrl;
    resultEl.style.display = "block";
    statusEl.textContent = result.cacheHit ? "Loaded from cache!" : "Done!";
  } catch (err) {
    statusEl.textContent = "Try-on failed. Please try again.";
    console.error(err);
  }
});
```

---

## Step 6 — Test It

1. Start your local dev server
2. Open the page in browser
3. Upload a folder of photos
4. Add a product image URL
5. Click Try On
6. Wait ~20 seconds for result

---

## Checklist

- [ ] `HP_API_KEY` in `.env`
- [ ] `JWT_SECRET` in `.env`
- [ ] `POST /auth/tryon-token` endpoint added
- [ ] `POST /api/tryon/submit` proxy endpoint added
- [ ] `GET /api/tryon/status/:jobId` proxy endpoint added
- [ ] SDK initialized with `proxyUrl` + `getToken`
- [ ] File input connected to `sdk.ingestImages()`
- [ ] Try-on button connected to `sdk.personalize()`
- [ ] Result image display handled
- [ ] Error handling added

---

## Common Issues

**"Invalid token" error**
- Check your JWT_SECRET is set in `.env`
- Make sure `getToken` is returning the token string, not the full response object

**"Failed to fetch" error**
- Check your proxy endpoints exist and are running
- Make sure CORS is configured on your backend (allow your frontend origin)

**"Personalization timed out"**
- HP may be under load — retry
- Increase `pollMaxAttempts` in config if needed

**Next.js Turbopack issue**
- Use `next dev --webpack` instead of `next dev`
