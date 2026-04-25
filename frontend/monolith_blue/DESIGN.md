# Design System Specification: Architectural Precision

## 1. Overview & Creative North Star
The Creative North Star for this design system is **"The Brutalist Editor."**

This system moves away from the "soft" web of rounded corners and decorative shadows, embracing a high-end, editorial aesthetic rooted in corporate precision and methodical utility. It is designed to feel like a high-performance instrument—unapologetically sharp, mathematically rigorous, and intellectually honest.

We break the "template" look through **Stark Duality** and **Intentional Asymmetry**. By leveraging the tension between deep off-blacks (`#171717`) and pure whites (`#ffffff`), we create a rhythmic flow that guides the eye through data-heavy environments with the authority of a broadsheet newspaper. We do not use borders to separate ideas; we use the structural weight of the 8px grid and tonal shifts to define the boundaries of thought.

## 2. Colors & Tonal Architecture
The palette is a study in high-contrast restraint. We utilize a monochromatic foundation with a singular, high-energy technical accent.

### The "No-Line" Rule
**Explicit Instruction:** 1px solid borders are prohibited for sectioning. Structural boundaries must be defined solely through background color shifts or the strategic use of vertical whitespace. If two areas need separation, move from `surface` to `surface-container-low`.

### Surface Hierarchy & Nesting
Depth is achieved through **Tonal Stacking**. Treat the UI as a physical desk of stacked paper:
*   **Base Layer:** `surface` (#fcf9f8)
*   **Secondary Content:** `surface-container-low` (#f6f3f2)
*   **Interactive/Elevated Modules:** `surface-container-highest` (#e5e2e1)

### Signature Textures & The "Glass & Gradient" Rule
To prevent the UI from feeling "flat" or "cheap," use subtle technical gradients for primary actions. A transition from `primary_container` (#0f62fe) to `primary` (#004ccd) adds a "lithographic" depth to CTAs. For floating panels, use `surface_container_lowest` (#ffffff) with a 90% opacity and a `20px backdrop-blur` to create a "Frosted Silica" effect that feels premium and integrated.

## 3. Typography: The Editorial Voice
We use **Public Sans** (as a high-clarity alternative to Plex) to maintain a neutral, modernist tone. The hierarchy is extreme, using light weights for massive displays and semi-bold for micro-labels.

*   **Display (300 Weight):** Used for "Hero" moments and section headers. The light weight at large scales (`display-lg` at 3.5rem) conveys sophistication and breathing room.
*   **Headlines/Titles (600 Weight):** Used for technical labeling and card titles. This provides the "anchor" for the eye.
*   **Body (400 Weight):** Optimized for long-form reading. Line heights are strictly adhered to the 8px grid.
*   **Labels (600 Weight, All Caps):** Used for metadata and overlines to provide a utilitarian, "stamped" aesthetic.

## 4. Elevation & Depth: Tonal Layering
In this system, shadows do not exist. We replace "Physical Depth" with "Logical Layering."

*   **The Layering Principle:** Place a `surface_container_lowest` (#ffffff) component on top of a `surface_container` (#f0edec) background. The 1.5% shift in hex value is enough for the human eye to perceive a change in hierarchy without the clutter of a drop shadow.
*   **The "Ghost Border" Fallback:** If accessibility requires a stroke (e.g., high-contrast mode), use `outline_variant` (#c3c6d8) at **15% opacity**. This creates a "whisper" of a boundary that preserves the sharp, monolithic aesthetic.
*   **Hard Edges:** All containers must maintain a **0px border-radius**. The "sharpness" is our signature.

## 5. Components

### Buttons
*   **Primary:** Solid `primary_container` (#0f62fe), white text, 0px radius. Use a subtle 2px bottom-indent on hover.
*   **Secondary:** `on_surface` (#1c1b1b) text with a `surface_container_high` (#eae7e7) background.
*   **Ghost:** `primary` text, no background, 8px padding. On hover, shift background to `primary_fixed`.

### Input Fields (The Signature "Underline")
*   **Styling:** No four-sided boxes. Inputs consist of a `surface_container_low` background and a 2px bottom-border using `outline`.
*   **States:** On focus, the bottom border animates to `primary` (#0f62fe). Error states use a `error` (#ba1a1a) bottom border and a `error_container` background tint.

### Cards & Lists
*   **Constraint:** Forbid divider lines. Use balanced vertical whitespace (following the standard 8px grid increments) to separate items, ensuring a clear but comfortable layout.
*   **Interaction:** On hover, a card should shift from `surface` to `surface_container_lowest` to "lift" towards the user through color alone.

### Additional Signature Component: The "Data Monolith"
A specialized container for key metrics. A large `display-sm` value sitting atop a `label-sm` descriptor, encased in a `surface_container_highest` block. No borders, no icons—just raw data and typography.

## 6. Do's and Don'ts

### Do:
*   **Use the 8px Grid Religiously:** Every margin, padding, and height must be a multiple of 8. The system adopts a standard, balanced spacing rhythm for clear information hierarchy.
*   **Embrace Negative Space:** If a screen feels cluttered, do not add a border; leverage the default spacing increments to provide air.
*   **Align Everything:** Use hard vertical alignments. If an element is "off-grid," it is a bug, not a feature.

### Don't:
*   **No Rounded Corners:** Never use a border-radius. Even a 2px radius destroys the "Architectural" intent.
*   **No Standard Shadows:** Do not use `box-shadow`. If you need depth, use a darker background color for the parent container.
*   **No Centered Layouts:** Prefer left-aligned, "asymmetric heavy" layouts that mimic modern architectural blueprints or editorial spreads.