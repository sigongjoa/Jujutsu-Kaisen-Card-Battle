# 🎨 Frontend Graphic Asset Integration Plan

## 1. Situation Analysis
**Objective:** Implement "Data-Driven UI" for Cards (3-Layer Structure).
**Input:**
- **Spec:** Requires 3 Layers (Frame, Transparent Character, Data/Icons).
- **Current Assets:** `asset/` folder contains raw JPG files with Korean filenames.

## 2. Gap Analysis (Spec vs. Reality)

| Requirement (Spec) | Current Asset Status (`asset/`) | Action Required |
|-------------------|---------------------------------|-----------------|
| **Layer 1: Frames** | ❌ Missing explicit "Empty Frames". We have `이타토리.jpg` etc., which might be full cards? | **Need to identify or create empty frames.** If `이타토리.jpg` is the frame, we need to verify. |
| **Layer 2: Characters** | ⚠️ `이타도리 누끼.jpg` exists but is **JPG** (No Transparency). | **Convert to PNG.** Background must be removed for layering to work. |
| **Layer 3: Icons** | ⚠️ `아이콘.jpg` exists as a single file. | **Slice** into individual PNGs (`icon-cost.png`, `icon-atk.png`, `icon-hp.png`). |
| **File Naming** | Korean (`고죠.jpg`) | **Rename** to English (`gojo.jpg`) for code maintainability. |

## 3. Implementation Roadmap

### Phase 1: Asset Preparation (Immediate)
1.  **Rename & Move:** Move files from `asset/` to `frontend/public/assets/` and rename them to English.
    - `이타도리 누끼.jpg` -> `cards/characters/itadori.jpg` (Temporary until PNG)
    - `아이콘.jpg` -> `ui/icons-sheet.jpg`
    - `카드뒷면.jpg` -> `ui/card-back.jpg`
2.  **Icon Slicing:** (If possible with CSS) Use `object-position` to display icons from the sprite sheet, or request sliced PNGs.

### Phase 2: Component Development (`src/components/card/`)
We will create a structured component system:

```tsx
// src/components/card/Card.tsx
<div className="card-container">
  {/* Layer 1: Frame */}
  <CardFrame type={card.type} />
  
  {/* Layer 2: Character */}
  <CardCharacter image={card.image} />
  
  {/* Layer 3: Stats & UI */}
  <CardUI stats={card.stats} cost={card.cost} />
</div>
```

### Phase 3: Data Mapping
Create a mapping file `src/constants/assets.ts` to link DB IDs to file paths.

```typescript
export const CHARACTER_MAP = {
  'ITADORI_YUJI': '/assets/cards/characters/itadori.png',
  'GOJO_SATORU': '/assets/cards/characters/gojo.png',
  // ...
};
```

## 4. Immediate Action Items for User
To achieve the "Premium" look described in the spec:
1.  **Transparency is Key:** Please provide the Character images (`누끼`) as **PNGs with transparent backgrounds**. JPGs will show a white box around the character.
2.  **Frames:** Please confirm which files are the "Empty Frames". If they are missing, we need them (or we can use CSS borders temporarily).

## 5. Next Step (My Action)
I will proceed with **Phase 1 (Rename & Move)** and **Phase 2 (Component Structure)** using the current JPGs as placeholders. This allows development to proceed while waiting for the proper PNG assets.
