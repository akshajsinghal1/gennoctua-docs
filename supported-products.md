# Supported Products

> Complete list of product types supported for virtual try-on.

---

## Quick Reference

| Product | `productType` value | Photo Required | Status |
|---|---|---|---|
| Sunglasses | `sunglasses` | Face photo | ✅ Live |
| Eyeglasses / reading glasses | `eyeglasses` | Face photo | ✅ Live |
| Men's clothing | `mens_clothing` | Full body (male) | ✅ Live |
| Women's clothing | `womens_clothing` | Full body (female) | ✅ Live |
| Kids' clothing | `kids_clothing` | Full body (child) | ✅ Live |
| Shoes / sneakers / boots | `footwear` | Full body (any) | ✅ Live |
| Necklaces / jewellery | `jewellery` | Face photo | ✅ Live |
| Earrings | `earrings` | Face photo | ✅ Live |
| Handbags / purses | `bags` | Full body (any) | ✅ Live |
| Lipstick | `makeup_lipstick` | Face photo | ✅ Live |
| Foundation | `makeup_foundation` | Face photo | ✅ Live |
| Mascara | `makeup_mascara` | Face photo | ✅ Live |
| Bedroom furniture | `bedroom_furniture` | — | 🔜 Phase 2 |
| Bathroom furniture | `bathroom_furniture` | — | 🔜 Phase 2 |
| Living room furniture | `living_room_furniture` | — | 🔜 Phase 2 |
| Kitchen furniture | `kitchen_furniture` | — | 🔜 Phase 2 |
| Home decor | `home_decor` | — | 🔜 Phase 2 |

---

## Photo Requirements by Product

### Face Photo Required
These products overlay onto the face or neck area. The user must upload at least one photo showing a clear, front-facing face.

| Product | `productType` |
|---|---|
| Sunglasses | `sunglasses` |
| Eyeglasses | `eyeglasses` |
| Necklaces / jewellery | `jewellery` |
| Earrings | `earrings` |
| Lipstick | `makeup_lipstick` |
| Foundation | `makeup_foundation` |
| Mascara | `makeup_mascara` |

**Accepted user image categories:** `male_face_closeup`, `female_face_closeup`, `child_face_closeup`

---

### Full Body Photo Required
These products are placed on the full body. The user must upload at least one clear, full-body standing photo.

| Product | `productType` | Gender restriction |
|---|---|---|
| Men's clothing | `mens_clothing` | Male only |
| Women's clothing | `womens_clothing` | Female only |
| Kids' clothing | `kids_clothing` | Child only |
| Shoes / sneakers | `footwear` | Any gender |
| Handbags / purses | `bags` | Any gender |

**Accepted user image categories (clothing):**
- `mens_clothing` → requires `male_full_body`
- `womens_clothing` → requires `female_full_body`
- `kids_clothing` → requires `child_full_body`
- `footwear` → accepts `male_full_body`, `female_full_body`, or `child_full_body`
- `bags` → accepts `female_full_body` or `male_full_body`

---

### Phase 2 — Coming Soon
Furniture and home decor products do not require user photos — they use room/environment context instead. These product types are defined in the SDK but will return `PRODUCT_TYPE_UNSUPPORTED` from `sdk.checkEligibility()` until Phase 2 launches.

| Product | `productType` |
|---|---|
| Bedroom furniture | `bedroom_furniture` |
| Bathroom furniture | `bathroom_furniture` |
| Living room furniture | `living_room_furniture` |
| Kitchen furniture | `kitchen_furniture` |
| Home decor | `home_decor` |

---

## TypeScript Type

```ts
type ProductType =
  | "sunglasses"
  | "eyeglasses"
  | "mens_clothing"
  | "womens_clothing"
  | "kids_clothing"
  | "footwear"
  | "jewellery"
  | "earrings"
  | "bags"
  | "makeup_lipstick"
  | "makeup_foundation"
  | "makeup_mascara"
  | "bedroom_furniture"
  | "bathroom_furniture"
  | "living_room_furniture"
  | "kitchen_furniture"
  | "home_decor";
```

---

## Checking Eligibility

Before starting a try-on, call `sdk.checkEligibility(productType)` to verify the user has uploaded the right kind of photo:

```ts
const eligibility = sdk.checkEligibility("sunglasses");

if (eligibility.eligible) {
  // Show Try On button
} else {
  switch (eligibility.reason) {
    case "REQUIRED_USER_IMAGE_MISSING":
      // User hasn't uploaded a face photo yet
      // eligibility.requiredCategory tells you which one is needed
      break;
    case "PRODUCT_TYPE_UNSUPPORTED":
      // Product type is Phase 2 — not yet available
      break;
    case "PRODUCT_TYPE_NOT_FOUND":
      // productType was not provided
      break;
  }
}
```

---

## Best Practices for Product Images

For the best try-on results:

- Use a **white or transparent background** product image
- Make sure the product is clearly visible and fills most of the frame
- Use a **high-resolution image** (at least 512×512px)
- For clothing: use a flat-lay or mannequin photo, not a model photo
- For eyewear: a straight-on front view works best

---

## What Happens Internally

When you call `sdk.personalize({ imageUrl, productType })`, the SDK:

1. Maps your `productType` to a **broad category** (sent to HP as `category`)
2. Maps your `productType` to a **descriptive label** (sent as `product_type`)

| `productType` | Category sent | Label sent |
|---|---|---|
| `sunglasses` | `eyewear` | `sunglasses` |
| `eyeglasses` | `eyewear` | `eyeglasses` |
| `mens_clothing` | `clothing` | `mens clothing` |
| `womens_clothing` | `clothing` | `womens clothing` |
| `kids_clothing` | `clothing` | `kids clothing` |
| `footwear` | `footwear` | `footwear` |
| `jewellery` | `jewellery` | `jewellery necklace` |
| `earrings` | `jewellery` | `earrings` |
| `bags` | `accessories` | `bag` |
| `makeup_lipstick` | `makeup` | `lipstick` |
| `makeup_foundation` | `makeup` | `foundation` |
| `makeup_mascara` | `makeup` | `mascara` |
| `bedroom_furniture` | `accessories` | `bedroom furniture` |
| `bathroom_furniture` | `accessories` | `bathroom furniture` |
| `living_room_furniture` | `accessories` | `living room furniture` |
| `kitchen_furniture` | `accessories` | `kitchen furniture` |
| `home_decor` | `accessories` | `home decor` |

You don't need to know any of this — just pass the `productType` value and the SDK handles the rest.
