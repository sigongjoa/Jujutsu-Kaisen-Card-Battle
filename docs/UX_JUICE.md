# UI & UX Polish (Juice)

## Overview
This document describes the visual and interaction enhancements that will make the game feel more responsive, exciting, and clear for players. The focus is on **feedback**, **pacing**, and **thematic immersion**.

## 1. Damage Numbers
- **Use‑case**: When a player attacks, a red floating number (e.g., `-10`) appears above the opponent avatar and fades out.
- **Implementation**:
  - Add a `<div class="damage-number">-10</div>` element dynamically via React when `handleAttack` resolves.
  - CSS animation: `@keyframes floatUp {0% {opacity:1; transform:translateY(0);} 100% {opacity:0; transform:translateY(-30px);}}`
  - Duration: 0.8 s, easing `ease-out`.
- **Acceptance Criteria**:
  - Number appears within 100 ms of attack.
  - Disappears after animation.
- **Test Cases**:
  1. Simulate an attack and verify a DOM element with class `damage-number` is added.
  2. Verify the element is removed after 1 s.

## 2. Screen Shake
- **Use‑case**: Powerful attacks (e.g., "Black Flash") cause a brief screen shake.
- **Implementation**:
  - Add a CSS class `.shake` on the root `.game-board` element.
  - `@keyframes shake {0% {transform:translate(0,0);} 20% {transform:translate(-5px,5px);} 40% {transform:translate(5px,-5px);} 60% {transform:translate(-5px,5px);} 80% {transform:translate(5px,-5px);} 100% {transform:translate(0,0);}}`
  - Apply for 0.3 s.
- **Acceptance Criteria**:
  - Shake triggers only for attacks flagged as `isHeavy`.
- **Test Cases**:
  1. Mock a heavy attack and assert `.shake` class is added and removed after 300 ms.

## 3. Card Entry Animation
- **Use‑case**: When a card is played from hand to field, it slides in with a glow.
- **Implementation**:
  - Wrap `CardView` with `framer-motion` `<motion.div>`.
  - Animate from `scale:0.8, opacity:0` to `scale:1, opacity:1` with a slight glow (`box-shadow`).
- **Acceptance Criteria**:
  - Animation duration ≤ 0.4 s.
- **Test Cases**:
  1. Render a card, trigger `handleCardClick`, and verify the motion component receives the correct `initial` and `animate` props.

## 4. Turn Timer
- **Use‑case**: Players see a visual countdown for their turn, preventing idle games.
- **Implementation**:
  - Add a circular progress bar (SVG) at the top‑center.
  - Timer length configurable (default 30 s).
  - When timer reaches 0, automatically invoke `handlePass`.
- **Acceptance Criteria**:
  - Timer updates every second.
  - Auto‑pass occurs exactly at timeout.
- **Test Cases**:
  1. Fast‑forward timer to 0 and assert `handlePass` is called.

## 5. Phase Indicator
- **Use‑case**: Transition between phases (Recharge → Main → Battle) is clearly announced.
- **Implementation**:
  - Overlay a large centered text (`<div class="phase-banner">BATTLE PHASE</div>`).
  - Fade‑in/out animation (0.5 s).
- **Acceptance Criteria**:
  - Banner appears on every phase change.
- **Test Cases**:
  1. Simulate phase change event and verify banner appears with correct text.

## 6. Theme Change on Ultimate
- **Use‑case**: When a character uses an ultimate ability, background image and BGM switch to a themed version.
- **Implementation**:
  - Store theme assets in `public/assets/themes/`.
  - Dispatch a Redux action `setTheme(themeId)`.
  - `GameBoard` reacts by swapping background CSS and playing new audio.
- **Acceptance Criteria**:
  - Theme changes instantly on ultimate activation.
- **Test Cases**:
  1. Trigger ultimate and assert background URL changes.
  2. Verify audio element source updates.

---
**Next Steps**: Prioritize Damage Numbers & Card Entry Animation (quick win). Follow with Turn Timer & Phase Indicator. Finally implement Screen Shake, Theme Change, and full theme asset pipeline.
