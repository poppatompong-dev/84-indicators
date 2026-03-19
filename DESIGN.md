# Design System Specification: The Living Portfolio

## 1. Overview & Creative North Star
### Creative North Star: "The Digital Arboretum"
This design system rejects the sterile, "boxy" nature of standard SaaS platforms. Instead, it adopts the persona of a high-end editorial journal combined with the precision of a research laboratory. We move beyond "Modern Eco" by treating the UI as a living ecosystem. 

**The Editorial Shift:** We break the rigid grid through **Intentional Asymmetry**. Large-scale typography (Manrope) should feel anchored and authoritative, while UI elements (Inter) float within high-contrast negative space. We utilize overlapping layers—where a data card might subtly bleed over a hero section boundary—to create a sense of depth and organic growth rather than static containment.

---

## 2. Colors & Tonal Depth
The palette is rooted in the "Deep Forest" and "Mint Leaf" spectrum, but its application is governed by sophisticated environmental lighting rather than flat fills.

### The "No-Line" Rule
**Explicit Instruction:** Traditional 1px solid borders are strictly prohibited for sectioning or card definition. Structure must be achieved exclusively through:
*   **Background Shifts:** Placing a `surface-container-low` (#f4f2ff) section atop a `surface` (#fbf8ff) base.
*   **Tonal Transitions:** Defining boundaries through subtle shifts in saturation or value.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers—like stacked sheets of frosted glass or fine sustainable paper.
*   **Level 0 (Base):** `surface` (#fbf8ff) – The expansive canvas.
*   **Level 1 (Sections):** `surface-container-low` (#f4f2ff) – Used for large content blocks.
*   **Level 2 (Cards/Modules):** `surface-container-lowest` (#ffffff) – The highest "physical" lift for interactive content.
*   **Level 3 (Overlays):** `surface-bright` (#fbf8ff) – Reserved for floating menus or modals.

### The "Glass & Gradient" Rule
To escape the "out-of-the-box" look, use **Glassmorphism** for floating elements. Apply `surface_variant` at 60% opacity with a `20px` backdrop-blur. 
*   **Signature Textures:** Use a subtle linear gradient (135°) from `primary` (#012d1d) to `primary_container` (#1b4332) for primary CTAs and Hero backgrounds to provide a "velvet" depth.

---

## 3. Typography
We use a dual-font strategy to balance scientific evidence with high-end storytelling.

*   **Display & Headlines (Manrope):** These are your "Editorial Anchors." Use `display-lg` (3.5rem) with tight letter-spacing (-0.02em) to command attention. Manrope’s geometric yet warm curves suggest "Sustainable Tech."
*   **Titles & Body (Inter):** Your "Technical Workhorse." Inter provides maximum legibility for complex sustainability data. Use `body-md` (0.875rem) for data-heavy sections to maintain a clean, professional density.
*   **Hierarchy Note:** Always pair a `headline-lg` in `on_surface` (#161a32) with a `label-md` in `secondary` (#006c48) to create an immediate visual link between the "Title" and the "Growth" aspect of the contest.

---

## 4. Elevation & Depth
Depth is a psychological cue for "Evidence." Flatness is for drafts; layered depth is for verified portfolios.

*   **The Layering Principle:** Rather than shadows, stack `surface_container_highest` (#dee0ff) behind a `surface_container_lowest` (#ffffff) card with a `16` (4rem) offset to create a "shadow-less" physical lift.
*   **Ambient Shadows:** For floating action buttons or modals, use a custom shadow: `box-shadow: 0 20px 40px rgba(22, 26, 50, 0.06);`. The shadow color is a tint of `on_surface`, never pure black.
*   **The "Ghost Border" Fallback:** If a border is required for accessibility, use `outline_variant` (#c1c8c2) at **15% opacity**. Anything more is considered "visual noise."

---

## 5. Components

### Primary Buttons
*   **Style:** Gradient fill (`primary` to `primary_container`).
*   **Radius:** `md` (0.75rem).
*   **Interaction:** On hover, a subtle scale-up (1.02x) and a shift to `secondary` (#006c48) to signify "growth."

### Status Badges (The "Signal" System)
*   **Completed:** Background: `secondary_fixed` (#92f7c3); Text: `on_secondary_fixed_variant` (#005235).
*   **Pending:** Background: `surface_container_high` (#e5e6ff); Text: `on_surface_variant` (#414844).
*   **Review Required:** Background: `tertiary_fixed` (#ffdf9c); Text: `tertiary` (#332400).
*   **Shape:** Pill-shaped (`full` roundedness) with `label-sm` bold typography.

### Progress Indicators (The "Eco-Donut")
*   **Visual:** Use a `2px` stroke for the empty track (`outline_variant`) and a `6px` stroke for the progress (`secondary`). This "thick-on-thin" contrast feels bespoke and technical.

### Data Cards & Lists
*   **Constraint:** **Forbid divider lines.** 
*   **Solution:** Use the Spacing Scale `6` (1.5rem) to separate list items. Use a `surface_container_low` background on hover to define the interactive area.

### Sustainability Metric Inputs
*   **Style:** Soft-filled backgrounds (`surface_container`) rather than outlined boxes. On focus, transition the background to `surface_container_lowest` and apply a `2px` "Ghost Border" of `primary`.

---

## 6. Do’s and Don’ts

### Do:
*   **Do** use asymmetrical margins. If the left margin is `16` (4rem), try a right margin of `24` (6rem) for editorial layouts.
*   **Do** lean into white space. If you think there is enough space, add `2.5rem` more.
*   **Do** use the `tertiary` (Solar Gold) sparingly. It is a "Status Alert," not a decoration.

### Don’t:
*   **Don’t** use pure black (#000000) for text. Always use `on_surface` (#161a32) to maintain the "Ink on Paper" feel.
*   **Don’t** use sharp corners. Sustainability is organic; even the smallest `sm` (0.25rem) radius is better than `none`.
*   **Don’t** use standard "Drop Shadows" from component libraries. They muddy the "Sustainable Tech" aesthetic. Stick to Tonal Layering.

---

## 7. Spacing & Rhythm
*   **Grid:** 12-column fluid grid, but content should frequently "break" the grid. For example, a pull-quote or an image might span from column 2 to column 11.
*   **Rhythm:** Use the `4` (1rem) base unit. All padding/margin should be multiples of 4 (e.g., 4, 8, 12, 16, 20). This mathematical consistency provides the "Evidence-Based" feel users subconsciously trust.