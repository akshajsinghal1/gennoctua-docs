# Product Overview

> For product managers, brand decision-makers, and business stakeholders.

---

## What is it?

`@gennoctua/personalize-core` is an AI virtual try-on SDK built by Gennoctua. It allows shoppers on any fashion brand's website to see how a product looks on them — without needing a physical fitting room.

The shopper uploads a photo. The AI generates a realistic image of them wearing the product. The whole process takes about 20 seconds.

---

## What problem does it solve?

**The core problem:** Online shoppers can't try products before buying. This leads to:
- High return rates (20–40% for fashion)
- Low conversion rates
- Poor customer confidence

**What virtual try-on does:**
- Shoppers see themselves wearing the product
- Confidence increases → conversions increase
- Returns decrease → costs decrease

---

## How does it work? (Non-technical)

```
1. Shopper visits your product page
2. Clicks "Try On"
3. Uploads a photo (or selects from previously uploaded photos)
4. AI automatically picks the best photo
5. AI generates a personalized image (~20 seconds)
6. Shopper sees themselves wearing the product
7. Toggle between original and personalized view
```

The AI runs entirely in the background. Your brand's website looks and feels exactly the same — you just add the try-on capability on top.

---

## What products does it support?

| Category | Products |
|---|---|
| Eyewear | Sunglasses, Eyeglasses |
| Clothing | Men's, Women's, Kids' |
| Footwear | All footwear |
| Jewellery | Necklaces, Earrings |
| Bags | All bags |
| Makeup | Lipstick, Foundation, Mascara |
| Furniture | Bedroom, Bathroom, Living Room, Kitchen |
| Home Decor | General home decor |

See [Supported Products](./supported-products.md) for the complete list.

---

## What does the brand need to provide?

**Very little.** The brand provides:
- Their own website (any tech stack)
- Product image URLs
- Their own UI (buttons, modals, loading indicators)

**The SDK provides everything else:**
- AI model loading and running
- Photo analysis and best photo selection
- Job submission to AI backend
- Result delivery and caching
- Analytics events

---

## Integration effort

| Scenario | Time to integrate |
|---|---|
| Frontend-only (no backend) | ~2 hours |
| Full-stack (existing backend) | ~4 hours |
| Cloning an existing website | ~30 minutes |

---

## Two types of brands we serve

### Full-Stack Brands
Have their own frontend AND backend (e.g. Next.js + Node.js, Django, Rails).

- They store the AI API key on their own server
- They build a small proxy endpoint (we provide the code — copy/paste)
- Their users never see the API key

### Frontend-Only Brands
Have only a frontend (Shopify, Webflow, plain HTML, etc.). No custom backend.

- They get a brand key from Gennoctua (`gn_pk_...`)
- They add one line to their website
- Gennoctua handles everything else on the backend

---

## Privacy & Security

- **User photos** are processed in the browser using local AI models — they are never stored on any server without explicit consent
- **AI generation** requires sending the selected profile photo to the AI backend — this is the minimum required for the feature to work
- **API keys** are never exposed in the browser — they live on the server only
- **Session tokens** expire after 1 hour — stolen tokens have a very limited window of abuse
- **Rate limiting** is built in — prevents abuse and runaway API costs

---

## Analytics & Tracking

The SDK fires events for every key action. Your team can track:

- How many users clicked "Try On"
- How many completions vs failures
- Cache hit rate (repeat users)
- Latency per product type

Events are fired via a simple callback — no external tracking calls, no third-party analytics SDKs required.

---

## Performance

| Metric | Typical value |
|---|---|
| Profile selection (first time, cold models) | ~20 seconds |
| Profile selection (subsequent, cached models) | ~5 seconds |
| AI generation | ~20–40 seconds |
| Total first try-on | ~40–60 seconds |
| Total repeat try-on (cached result) | <1 second |

Results are cached locally — if a user tries on the same product again, the result appears instantly.

---

## Limitations

- Requires a modern browser (Chrome, Firefox, Safari, Edge — last 2 versions)
- Photo upload required — no camera/live AR support yet
- AI generation quality depends on photo quality (clear, well-lit, front-facing photos work best)
- Generation time can vary (20s–60s) depending on AI backend load
