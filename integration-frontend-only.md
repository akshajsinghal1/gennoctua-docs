# Frontend-Only Integration Guide

> For developers who have only a frontend — Shopify, Webflow, plain HTML, or any site with no custom backend.

---

## Overview

In frontend-only mode, Gennoctua's servers handle everything on the backend for you:
- Token generation
- Proxying to HyperPersona
- API key management

You just need a **brand key** (`gn_pk_...`) from Gennoctua.

```
Browser (SDK) → Gennoctua Backend → HyperPersona AI
```

---

## Step 1 — Get your brand key

Contact Gennoctua to get your brand key. You'll receive something like:
```
gn_pk_yourbrand_a3f8c2d1e4b5f6a7
```

Keep this safe — don't share it publicly (though it's safe to use in frontend code, it's tied to your brand's usage limits).

---

## Step 2 — Install the SDK

### Option A — npm (React, Vue, Vite, etc.)
```bash
npm install @gennoctua/personalize-core
```

### Option B — Script tag (plain HTML, Shopify, Webflow)
```html
<script src="https://cdn.gennoctua.com/personalize.min.global.js"></script>
```

---

## Step 3 — Initialize the SDK

### npm
```ts
import { Personalize } from "@gennoctua/personalize-core";

const sdk = await Personalize.init({
  auth: {
    publicKey: "gn_pk_yourbrand_xxx"
  }
});
```

### Script tag
```html
<script>
  const sdk = await window.Personalize.init({
    auth: {
      publicKey: "gn_pk_yourbrand_xxx"
    }
  });
</script>
```

That's it. No backend needed. The SDK automatically contacts Gennoctua to get a session token.

---

## Step 4 — Add Upload UI

```html
<!-- Add this to your product page HTML -->
<input id="photoInput" type="file" multiple accept="image/*" webkitdirectory />
<p id="uploadStatus"></p>
```

```js
document.getElementById("photoInput").addEventListener("change", async (e) => {
  const status = document.getElementById("uploadStatus");
  status.textContent = "Processing photos...";

  try {
    const summary = await sdk.ingestImages(e.target.files, (progress) => {
      status.textContent = progress.message;
    });

    if (summary.availableCategories.length > 0) {
      status.textContent = "✓ Ready to try on!";
      document.getElementById("tryOnBtn").disabled = false;
    } else {
      status.textContent = "No usable photos found. Please upload clear face photos.";
    }
  } catch (err) {
    status.textContent = "Upload failed: " + err.message;
  }
});
```

---

## Step 5 — Add Try On Button

```html
<button id="tryOnBtn" disabled>Try On</button>
<p id="tryOnStatus"></p>
<img id="resultImg" style="display:none; max-width:400px" />
```

```js
document.getElementById("tryOnBtn").addEventListener("click", async () => {
  const status = document.getElementById("tryOnStatus");
  const resultImg = document.getElementById("resultImg");

  status.textContent = "Generating your try-on (~20 seconds)...";
  resultImg.style.display = "none";

  try {
    const result = await sdk.personalize({
      imageUrl: "YOUR_PRODUCT_IMAGE_URL",   // replace with your product image URL
      productType: "sunglasses",             // replace with your product type
    });

    resultImg.src = result.imageUrl;
    resultImg.style.display = "block";
    status.textContent = "Done!";
  } catch (err) {
    status.textContent = "Failed: " + err.message;
  }
});
```

---

## Complete Example (Plain HTML)

Copy and paste this into any HTML page:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Virtual Try-On</title>
</head>
<body>
  <h2>Try On This Product</h2>

  <!-- Product image -->
  <img id="productImg" src="YOUR_PRODUCT_IMAGE_URL" width="300" />

  <!-- Upload -->
  <br /><br />
  <label>Upload your photos:</label>
  <input id="photoInput" type="file" multiple accept="image/*" webkitdirectory />
  <p id="uploadStatus"></p>

  <!-- Try On -->
  <button id="tryOnBtn" disabled>Try On</button>
  <p id="tryOnStatus"></p>

  <!-- Result -->
  <img id="resultImg" style="display:none; max-width:400px" />

  <!-- Toggle -->
  <div id="toggleDiv" style="display:none">
    <button id="toggleBtn">← Show Original</button>
  </div>

  <script src="https://cdn.gennoctua.com/personalize.min.global.js"></script>
  <script>
    let sdk, resultUrl;

    // Initialize
    window.Personalize.init({
      auth: { publicKey: "gn_pk_yourbrand_xxx" }
    }).then(s => {
      sdk = s;
      console.log("SDK ready");
    });

    // Upload handler
    document.getElementById("photoInput").addEventListener("change", async (e) => {
      const status = document.getElementById("uploadStatus");
      status.textContent = "Processing photos...";
      const summary = await sdk.ingestImages(e.target.files, p => {
        status.textContent = p.message;
      });
      if (summary.availableCategories.length > 0) {
        status.textContent = "✓ Ready!";
        document.getElementById("tryOnBtn").disabled = false;
      } else {
        status.textContent = "No clear face photos found. Try different photos.";
      }
    });

    // Try On handler
    document.getElementById("tryOnBtn").addEventListener("click", async () => {
      const status = document.getElementById("tryOnStatus");
      status.textContent = "Generating (~20 seconds)...";

      try {
        const result = await sdk.personalize({
          imageUrl: document.getElementById("productImg").src,
          productType: "sunglasses"
        });

        resultUrl = result.imageUrl;
        document.getElementById("resultImg").src = resultUrl;
        document.getElementById("resultImg").style.display = "block";
        document.getElementById("toggleDiv").style.display = "block";
        document.getElementById("productImg").style.display = "none";
        status.textContent = "Done!";
      } catch (err) {
        status.textContent = "Failed: " + err.message;
      }
    });

    // Toggle
    let showingPersonalized = true;
    document.getElementById("toggleBtn").addEventListener("click", () => {
      showingPersonalized = !showingPersonalized;
      if (showingPersonalized) {
        document.getElementById("resultImg").style.display = "block";
        document.getElementById("productImg").style.display = "none";
        document.getElementById("toggleBtn").textContent = "← Show Original";
      } else {
        document.getElementById("resultImg").style.display = "none";
        document.getElementById("productImg").style.display = "block";
        document.getElementById("toggleBtn").textContent = "→ Show Try-On";
      }
    });
  </script>
</body>
</html>
```

---

## Shopify Integration

Add to your product page template (`sections/product.liquid` or similar):

```html
<!-- Add before </body> -->
<div id="tryon-widget">
  <input id="tryonPhotos" type="file" multiple accept="image/*" webkitdirectory />
  <button id="tryonBtn" disabled>Try On</button>
  <p id="tryonStatus"></p>
  <img id="tryonResult" style="display:none" />
</div>

<script src="https://cdn.gennoctua.com/personalize.min.global.js"></script>
<script>
  window.Personalize.init({
    auth: { publicKey: "gn_pk_yourbrand_xxx" }
  }).then(sdk => {
    document.getElementById("tryonPhotos").onchange = async (e) => {
      await sdk.ingestImages(e.target.files);
      document.getElementById("tryonBtn").disabled = false;
    };

    document.getElementById("tryonBtn").onclick = async () => {
      const result = await sdk.personalize({
        imageUrl: "{{ product.featured_image | img_url: 'master' }}",
        productType: "{{ product.type | downcase }}"
      });
      document.getElementById("tryonResult").src = result.imageUrl;
      document.getElementById("tryonResult").style.display = "block";
    };
  });
</script>
```

---

## Checklist

- [ ] Brand key received from Gennoctua (`gn_pk_...`)
- [ ] SDK installed (npm or script tag)
- [ ] `Personalize.init({ auth: { publicKey: "..." } })` called
- [ ] File input connected to `sdk.ingestImages()`
- [ ] Try-on button connected to `sdk.personalize()`
- [ ] Product image URL correctly set
- [ ] Product type correctly set (see [Supported Products](./supported-products.md))
- [ ] Result image display handled

---

## Common Issues

**"auth.publicKey is required" error**
- Make sure you're passing `publicKey` in the auth config, not `apiKey`

**"No usable photos found"**
- User photos must have clear, front-facing faces
- Ensure good lighting in photos
- At least one photo required

**"Personalization timed out"**
- HyperPersona may be under load — retry
- Check your internet connection

**Try-on result looks wrong**
- Make sure `productType` matches the actual product (see [Supported Products](./supported-products.md))
- Use a clean, white-background product image for best results
