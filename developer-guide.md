# Developer Guide

> Full technical reference for developers integrating `@gennoctua/personalize-core`.

---

## Prerequisites

- Modern browser environment (Chrome, Firefox, Safari, Edge — last 2 versions)
- HTTPS in production (required for browser AI models)
- Node.js 18+ (for backend proxy)

---

## Installation

### npm / yarn / pnpm
```bash
npm install @gennoctua/personalize-core
# or
yarn add @gennoctua/personalize-core
# or
pnpm add @gennoctua/personalize-core
```

### CDN (no install)
```html
<script src="https://cdn.gennoctua.com/personalize.min.global.js"></script>
<!-- window.Personalize is now available -->
```

### From GitHub (private repo)
```bash
npm install git+https://github.com/gennoctua/personalize-core.git
```

---

## Initialization

### Full-Stack Mode
```ts
import { Personalize } from "@gennoctua/personalize-core";

const sdk = await Personalize.init({
  auth: {
    proxyUrl: "https://yourbrand.com/api/tryon",
    getToken: async () => {
      const res = await fetch("/auth/tryon-token");
      const data = await res.json();
      return data.token;
    }
  },
  debug: false,
  analytics: {
    onEvent: (event) => console.log(event)
  }
});
```

### Frontend-Only Mode
```ts
import { Personalize } from "@gennoctua/personalize-core";

const sdk = await Personalize.init({
  auth: {
    publicKey: "gn_pk_yourbrand_xxx"
    // gennoctuaUrl is optional, defaults to "https://ec.gennoctua.com"
  }
});
```

### CDN (script tag)
```html
<script src="personalize.min.global.js"></script>
<script>
  const sdk = await window.Personalize.init({
    auth: {
      publicKey: "gn_pk_yourbrand_xxx"
    }
  });
</script>
```

---

## Core Workflow

```ts
// 1. Initialize SDK
const sdk = await Personalize.init({ auth: { ... } });

// 2. Subscribe to events (optional but recommended)
sdk.on("personalization:completed", ({ imageUrl }) => {
  document.getElementById("result").src = imageUrl;
});

sdk.on("personalization:failed", ({ error }) => {
  console.error("Try-on failed:", error);
});

// 3. Ingest user photos (from file input)
const fileInput = document.getElementById("photoInput");
fileInput.addEventListener("change", async (e) => {
  const summary = await sdk.ingestImages(e.target.files, (progress) => {
    console.log(progress.message); // "Scanning faces 3 of 14..."
  });
  console.log("Available categories:", summary.availableCategories);
});

// 4. Run personalization
const result = await sdk.personalize({
  imageUrl: "https://brand.com/product.jpg",
  productType: "sunglasses",
  productId: "sku-123"
});

console.log(result.imageUrl);   // personalized image URL
console.log(result.cacheHit);   // true if returned from cache
console.log(result.jobId);      // HyperPersona job ID
```

---

## Configuration Options

```ts
Personalize.init({
  // REQUIRED
  auth: ProxyAuthConfig | PublicKeyAuthConfig,

  // Product detection
  product: {
    imageSelector: ".product-image",       // CSS selector for product image
    gallerySelector: ".product-gallery",   // CSS selector for gallery
    productType: "sunglasses",             // force a specific product type
    rules: [                               // URL/title-based rules
      {
        match: { urlPattern: "/sunglasses/" },
        productType: "sunglasses"
      }
    ],
    detectFromStructuredData: true,        // use JSON-LD on page (default: true)
    detectFromDom: true,                   // use DOM heuristics (default: true)
  },

  // Cache settings
  cache: {
    resultTtlMs: 604800000,        // how long to cache results (default: 7 days)
    selectionTtlMs: 86400000,      // how long to cache profile selection (default: 24h)
    restoreActiveJobs: true,       // resume polling after page refresh (default: true)
    activeJobMaxAgeMs: 300000,     // don't restore jobs older than this (default: 5 min)
  },

  // Rate limiting
  rateLimit: {
    personalization: {
      enabled: true,
      cooldownMs: 10000,           // wait between requests (default: 10s)
      maxPerSession: 20,           // max try-ons per session (default: 20)
      maxPerProduct: 3,            // max try-ons per product (default: 3)
      singleFlight: true,          // deduplicate concurrent requests (default: true)
    },
    tagging: {
      enabled: true,
      cooldownMs: 5000,
      maxPerSession: 5,
    }
  },

  // Analytics
  analytics: {
    enabled: true,
    onEvent: (event) => {
      // send to your analytics platform
      mixpanel.track(event.eventName, event);
    }
  },

  // Other
  debug: false,                    // enable debug logging
  maxImages: 80,                   // max photos to process (default: 80)
  pollIntervalMs: 1500,            // SSE check interval (default: 1500ms)
  pollMaxAttempts: 120,            // max attempts before timeout (default: 120 = 3 min)
});
```

---

## Methods

### `sdk.ingestImages(files, onProgress?)`
Processes a FileList from a folder/file input. Runs face detection, gender classification, pose scoring, and selects the best profile photos.

```ts
const summary = await sdk.ingestImages(
  fileInputElement.files,
  (progress) => {
    // progress.message — human-readable status string
    // progress.step — current step number
    // progress.total — total steps
    updateProgressBar(progress.message);
  }
);

// summary.availableCategories — e.g. ["female_full_body", "female_face_closeup"]
// summary.missingCategories — categories not found in the uploaded photos
// summary.totalUploaded — total valid photos processed
// summary.totalSelected — number of profiles selected
```

### `sdk.personalize(opts)`
Submits a try-on job and returns the result.

```ts
const result = await sdk.personalize({
  imageUrl: "https://brand.com/product.jpg",  // REQUIRED — product image URL
  productType: "sunglasses",                   // REQUIRED — see supported types
  productId: "sku-123",                        // optional — for caching/tracking
  abortSignal: controller.signal,              // optional — cancel the request
});

// result.imageUrl — personalized image URL
// result.cacheHit — true if returned from cache (instant)
// result.jobId — job ID for debugging
```

### `sdk.checkEligibility(productType?)`
Check if a try-on can be performed before starting.

```ts
const eligibility = sdk.checkEligibility("sunglasses");

if (eligibility.eligible) {
  // show Try On button
} else {
  // eligibility.reason:
  // "REQUIRED_USER_IMAGE_MISSING" — no profile photo uploaded for this product type
  // "PRODUCT_TYPE_NOT_FOUND" — productType not provided
  // "PRODUCT_TYPE_UNSUPPORTED" — this product type is not supported
  console.log("Can't try on:", eligibility.reason);
}
```

### `sdk.on(event, handler)`
Subscribe to SDK events.

```ts
sdk.on("personalization:completed", ({ imageUrl, cacheHit, jobId }) => {
  showResult(imageUrl);
});

sdk.off("personalization:completed", handler); // unsubscribe
sdk.once("personalization:completed", handler); // one-time listener
```

See [API Reference](./api-reference.md) for all events.

---

## TypeScript Types

```ts
import type {
  SDKConfig,
  AuthConfig,
  ProxyAuthConfig,
  PublicKeyAuthConfig,
  ProductType,
  UserImageCategory,
  PersonalizationResult,
  SelectionSummary,
  EligibilityResult,
  SDKEventMap,
  SDKEventName,
  AnalyticsEvent,
} from "@gennoctua/personalize-core";
```

---

## Error Handling

```ts
import { SDKError } from "@gennoctua/personalize-core";

try {
  const result = await sdk.personalize({ imageUrl, productType });
} catch (err) {
  if (err instanceof SDKError) {
    switch (err.code) {
      case "AUTH_INVALID":
        // token expired or invalid — refresh token and retry
        break;
      case "RATE_LIMITED_CLIENT":
        // user is trying too fast — show cooldown message
        break;
      case "RATE_LIMITED_SERVER":
        // server rate limit — back off and retry
        break;
      case "JOB_FAILED":
        // AI generation failed — show error to user
        break;
      case "JOB_TIMEOUT":
        // took too long — retry or show error
        break;
      case "NETWORK_ERROR":
        // connectivity issue — check internet connection
        break;
    }
    console.log("Recoverable:", err.recoverable); // can the user retry?
  }
}
```

---

## React Integration

Install the React wrapper:
```bash
npm install @gennoctua/personalize-react
```

```tsx
import {
  PersonalizeProvider,
  usePersonalize,
  useImageIngestion,
  usePersonalization
} from "@gennoctua/personalize-react";

// Wrap your app
function App() {
  return (
    <PersonalizeProvider config={{ auth: { publicKey: "gn_pk_..." } }}>
      <ProductPage />
    </PersonalizeProvider>
  );
}

// Use in any component
function ProductPage() {
  const { sdk, ready } = usePersonalize();
  const { ingest, summary, ingesting } = useImageIngestion();
  const { personalize, result, loading, error } = usePersonalization();

  return (
    <div>
      <input type="file" multiple onChange={(e) => ingest(e.target.files)} />
      <button onClick={() => personalize({ imageUrl, productType: "sunglasses" })}>
        Try On
      </button>
      {result && <img src={result.imageUrl} />}
    </div>
  );
}
```

---

## Caching Behavior

Results are cached in **IndexedDB** (browser storage). Cache is keyed by:
```
orgId + userImageHash + productImageHash + productType
```

This means:
- Same user + same product = instant result (cache hit)
- Cache survives page refresh and browser close
- Default TTL: 7 days
- Clear cache: `sdk.cache.clearAll()`

---

## Browser Compatibility

| Browser | Min Version |
|---|---|
| Chrome | 90+ |
| Firefox | 88+ |
| Safari | 14+ |
| Edge | 90+ |
| Mobile Chrome | 90+ |
| Mobile Safari | 14+ |

---

## Bundler Compatibility

| Bundler | Support |
|---|---|
| Vite | ✅ |
| Webpack 5 | ✅ |
| Next.js (webpack mode) | ✅ |
| Next.js (Turbopack) | ⚠️ Use `--webpack` flag |
| Rollup | ✅ |
| esbuild | ✅ |
| Parcel | ✅ |
| Plain `<script>` tag | ✅ Use CDN bundle |
