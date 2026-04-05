# Design System Specification: Precise Sanctuary

## 1. Overview & Creative North Star
The Creative North Star for this design system is **"The Clinical Atelier."**

In an industry often defined by sterile, rigid templates, we move toward a "Precise Sanctuary"—an environment that balances the unwavering authority of a world-class institution with the calming respiration of high-end editorial design. We reject the "standard dashboard" look. Instead, we embrace **Intentional Asymmetry** and **Tonal Depth**. By utilizing wide margins, oversized display typography, and layered surfaces, we create an interface that feels curated rather than generated. The goal is to provide medical professionals with a tool that feels as precise as a scalpel and as restorative as a sanctuary.

---

## 2. Colors & Surface Architecture
Our palette is rooted in the "Deep Navy" of academic authority and the "Sage Green" of clinical growth.

### The Palette (Key Tokens)
- **Primary (Authority):** `#002045` (Primary) transitioning into `#1A365D` (Primary Container).
- **Secondary (Clinical Accent):** `#2C694E` (Secondary). Use for progress, health indicators, and subtle medical accents.
- **Tertiary (Urgency):** `#BA1A1A` (Error) / `#D32F2F`. Reserved exclusively for emergency actions.
- **Background (The Sanctuary):** `#F7F9FB`. A soft, off-white desaturated blue to eliminate monitor glare.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders for sectioning. Boundaries must be defined solely through background color shifts.
* *Implementation:* A `surface-container-low` (#F2F4F6) sidebar sitting against a `surface` (#F7F9FB) main content area provides enough contrast to define space without the "clutter" of lines.

### Surface Hierarchy & Nesting
Treat the UI as a physical stack of fine paper.
- Use **Nesting** to define importance. An inner card (`surface-container-lowest` / #FFFFFF) placed on a `surface-container` (#ECEEF0) base creates a natural focal point.
- **Glass & Gradient Rule:** For floating headers or navigation rails, use Glassmorphism. Apply `surface` colors at 80% opacity with a `20px` backdrop-blur.

### Signature Textures
Main CTAs must not be flat. Use a **Linear Gradient** (135°) from `primary` (#002045) to `primary_container` (#1A365D). This creates a "weighted" feel that communicates reliability and depth.

---

## 3. Typography: Editorial Authority
We pair **Manrope** (Display/Headlines) for its modern, geometric precision with **Inter** (Body/Labels) for its world-class legibility in dense clinical data.

| Role | Token | Font | Size | Weight | Intent |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Display** | `display-lg` | Manrope | 3.5rem | 700 | Hero metrics & Welcome states |
| **Headline** | `headline-sm`| Manrope | 1.5rem | 600 | Section entry points |
| **Title** | `title-md` | Inter | 1.125rem | 500 | Card titles & Modal headers |
| **Body** | `body-md` | Inter | 0.875rem | 400 | Patient data & Notes |
| **Label** | `label-sm` | Inter | 0.6875rem | 600 | Micro-data & Metadata (Caps) |

**Hierarchy Note:** Use the high-contrast scale to create an "Editorial" feel. Pair a `display-sm` metric immediately next to `label-md` descriptive text to emphasize data over decoration.

---

## 4. Elevation & Depth: Tonal Layering
We move away from the "shadow-heavy" look of 2010s Material Design.

* **The Layering Principle:** Depth is achieved by stacking. Place `surface-container-lowest` (#FFFFFF) elements atop `surface-container-low` (#F2F4F6) backgrounds to create a "lift" that feels organic to the light source.
* **Ambient Shadows:** For high-priority floating elements (Modals), use an extra-diffused shadow: `box-shadow: 0 20px 40px rgba(25, 28, 30, 0.06)`. The shadow must be low-opacity and tinted by the `on-surface` color.
* **Emergency Glow:** For emergency CTAs (`tertiary`), use a dual-shadow approach. A standard ambient shadow combined with a `0 0 15px rgba(211, 47, 47, 0.4)` glow to ensure the user’s eye is immediately drawn to the critical action.
* **The Ghost Border:** If contrast fails WCAG on a specific edge, use a "Ghost Border": `outline-variant` (#C4C6CF) at **15% opacity**.

---

## 5. Signature Components

### Primary Buttons
- **Style:** 135° Gradient (`primary` to `primary_container`).
- **Rounding:** `md` (0.375rem) for a balanced, professional look.
- **Interaction:** On hover, increase the gradient luminosity; do not shift the hue.

### Emergency CTAs
- **Style:** Solid `tertiary` (#D32F2F) with the "Emergency Glow" shadow.
- **Constraint:** Only one Emergency CTA per view to maintain the "Precise Sanctuary" calm.

### Clinical Cards & Lists
- **Rule:** **No Dividers.** Separate list items using `spacing-4` (0.9rem) of vertical white space or subtle alternating background shifts (`surface` vs `surface-container-low`).
- **Rounding:** Use `lg` (0.5rem) for cards to soften the clinical environment.

### Data Chips
- **Style:** `secondary_container` (#AEEECB) background with `on_secondary_container` (#316E52) text.
- **Shape:** `full` (9999px) for a "pill" aesthetic that distinguishes status from buttons.

### Critical Input Fields
- **Style:** `surface_container_lowest` (#FFFFFF) background.
- **State:** On focus, use a 2px `primary_fixed` (#D6E3FF) outer glow rather than a harsh border change.

---

## 6. Do's and Don'ts

### Do
- **Do** use `spacing-16` and `spacing-20` for page margins to give content "room to breathe."
- **Do** use `secondary` (Sage Green) for positive medical confirmations (e.g., "Stable," "Completed").
- **Do** lean into asymmetry. A large headline on the left with a small data-table on the right creates a premium, bespoke feel.

### Don't
- **Don't** use 100% black (#000000) for text. Always use `on_surface` (#191C1E) to maintain the soft sanctuary aesthetic.
- **Don't** use standard "drop shadows" with high opacity. They break the clinical cleanliness of the system.
- **Don't** use dividers to separate content blocks. Trust the spacing scale (`8`, `12`, `16`) to create logical grouping.