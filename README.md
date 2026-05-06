# @gennoctua/personalize-core — Documentation

> AI-powered virtual try-on SDK for fashion brands. Drop it into any website in minutes.

---

## Who is this for?

| I am... | Read this |
|---|---|
| A **product manager** evaluating the SDK | [Product Overview](./product-overview.md) |
| A **developer** integrating the SDK | [Developer Guide](./developer-guide.md) |
| A **full-stack developer** (have frontend + backend) | [Full-Stack Integration Guide](./integration-fullstack.md) |
| A **frontend-only developer** (no backend) | [Frontend-Only Integration Guide](./integration-frontend-only.md) |
| A **vibe coder** using AI to build websites | [Vibe Coder Guide](./vibe-coder-guide.md) |
| Looking for a specific method or event | [API Reference](./api-reference.md) |
| Checking supported product types | [Supported Products](./supported-products.md) |

---

## What is this?

`@gennoctua/personalize-core` is a headless JavaScript SDK that adds AI virtual try-on to any brand website. It handles everything — photo upload, face detection, AI generation, result display — with just a few lines of code.

**You bring:** your UI, your product catalog, your website.
**We bring:** the AI pipeline, the models, the backend.

---

## Quick Summary

```
User uploads photos → SDK picks the best one automatically
User clicks "Try On" → AI generates personalized image in ~20 seconds
Brand shows the result → User sees themselves wearing the product
```

---

## Two Integration Modes

### Full-Stack (you have a backend)
```ts
Personalize.init({
  auth: {
    proxyUrl: "https://yourbrand.com/api/tryon",
    getToken: async () => await getSessionToken()
  }
})
```

### Frontend-Only (no backend needed)
```ts
Personalize.init({
  auth: {
    publicKey: "gn_pk_yourbrand_xxx"
  }
})
```

---

## Package Contents

| File | What it is |
|---|---|
| `dist/index.js` | ESM package for bundlers (React, Vue, Vite) |
| `dist/index.cjs` | CommonJS package for Node.js |
| `dist/cdn/personalize.min.global.js` | CDN bundle for `<script>` tag |
| `dist/index.d.ts` | TypeScript type definitions |
