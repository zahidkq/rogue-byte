---
name: Rogue Byte
colors:
  surface: '#0b1326'
  surface-dim: '#0b1326'
  surface-bright: '#31394d'
  surface-container-lowest: '#060e20'
  surface-container-low: '#131b2e'
  surface-container: '#171f33'
  surface-container-high: '#222a3d'
  surface-container-highest: '#2d3449'
  on-surface: '#dae2fd'
  on-surface-variant: '#d8c3ad'
  inverse-surface: '#dae2fd'
  inverse-on-surface: '#283044'
  outline: '#a08e7a'
  outline-variant: '#534434'
  surface-tint: '#ffb95f'
  primary: '#ffc174'
  on-primary: '#472a00'
  primary-container: '#f59e0b'
  on-primary-container: '#613b00'
  inverse-primary: '#855300'
  secondary: '#4cd7f6'
  on-secondary: '#003640'
  secondary-container: '#03b5d3'
  on-secondary-container: '#00424e'
  tertiary: '#d5c3ff'
  on-tertiary: '#3c0091'
  tertiary-container: '#bda2ff'
  on-tertiary-container: '#520fbb'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffddb8'
  primary-fixed-dim: '#ffb95f'
  on-primary-fixed: '#2a1700'
  on-primary-fixed-variant: '#653e00'
  secondary-fixed: '#acedff'
  secondary-fixed-dim: '#4cd7f6'
  on-secondary-fixed: '#001f26'
  on-secondary-fixed-variant: '#004e5c'
  tertiary-fixed: '#e9ddff'
  tertiary-fixed-dim: '#d0bcff'
  on-tertiary-fixed: '#23005c'
  on-tertiary-fixed-variant: '#5516be'
  background: '#0b1326'
  on-background: '#dae2fd'
  surface-variant: '#2d3449'
typography:
  display:
    fontFamily: Space Grotesk
    fontSize: 2.5rem
    fontWeight: '700'
    lineHeight: 3rem
    letterSpacing: -0.03em
  display-mobile:
    fontFamily: Space Grotesk
    fontSize: 2rem
    fontWeight: '700'
    lineHeight: 2.25rem
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 1.75rem
    fontWeight: '600'
    lineHeight: 2.25rem
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 1.25rem
    fontWeight: '600'
    lineHeight: 1.75rem
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 1rem
    fontWeight: '400'
    lineHeight: 1.5rem
  body-md:
    fontFamily: Inter
    fontSize: 0.875rem
    fontWeight: '400'
    lineHeight: 1.25rem
  label-mono-lg:
    fontFamily: JetBrains Mono
    fontSize: 0.875rem
    fontWeight: '500'
    lineHeight: 1.25rem
    letterSpacing: 0.02em
  label-mono-sm:
    fontFamily: JetBrains Mono
    fontSize: 0.75rem
    fontWeight: '600'
    lineHeight: 1rem
    letterSpacing: 0.05em
  caption-mono:
    fontFamily: JetBrains Mono
    fontSize: 0.625rem
    fontWeight: '500'
    lineHeight: 0.875rem
    letterSpacing: 0.08em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 0.75rem
  gutter-tablet: 1rem
  margin: 1rem
  margin-mobile: 0.75rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1.25rem
  space-xl: 2rem
---

## Brand & Style

This design system blends tactical dark fantasy with high-octane cyberpunk arcade aesthetics, engineered specifically for high-intensity mobile web dungeon crawling. The visual language bridges gritty procedural crypts and hyper-responsive terminal telemetry, projecting an atmosphere of lethal precision, high stakes, and calculated risk.

The style fuses **tactical arcade minimalism** with **specular glassmorphism**:
- Ultra-deep slate voids act as canvas strata, cutting OLED battery draw while allowing critical status cues to pop with immediate acuity.
- HUD components rely on semi-translucent composite surfaces with razor-thin luminous inner borders, simulating hardened augmented-reality tactical visors.
- Mechanical interactions utilize micro-glow state indicators, tactile pressure shifts, and terminal-grade telemetry readouts rather than decorative ornamentation.
- Ambient dungeon feedback is delivered via distinct chromatic wavelengths: lethal urgency, technological shielding, atmospheric bio-hazards, and arcane power.

## Colors

The palette leverages deep, low-luminance slate baselines punctuated by precise, high-chroma functional lights. The roles are strictly segregated to ensure instantaneous peripheral recognition in split-second combat encounters:

- **Primary (`#F59E0B` Amber / `#FBBF24` Bright Gold):** Used for primary player focus, core action triggers, legendary loot tiering, physical attack telemetry, and tactical interactive controls.
- **Secondary (`#06B6D4` Electric Cyan):** Applied to mana reserves, kinetic energy barriers, plasma shielding, inventory filtering, and cyber-grid HUD diagnostics.
- **Tertiary (`#8B5CF6` Mystical Violet):** Denotes arcane power surges, anomalous relics, spatial rifts, cooldown cooldowns, and elite unit attributes.
- **Neutral (`#0F172A` Surface / `#090D16` Deep Abyss):** Grounding surfaces. `#090D16` forms the underlying viewport root; `#0F172A` provides the baseline for glass panels, modal decks, and inventory slots.
- **Status Accents:**
  - **Health / Threat (`#EF4444` Crimson):** Direct HP attrition, critical alerts, hostile intent zones, and lethal traps.
  - **Bio-hazard / Trap (`#10B981` Toxic Emerald):** Environmental blight, stamina, poison ticks, and passive passive buffs.

Maintain an 80/15/5 distribution rule: 80% deep charcoal/slate surfaces, 15% glass borders and neutral telemetry typography, and 5% focused neon luminance.

## Typography

The typography establishes a dual-personality framework: high-visibility structural headings with tactical terminal telemetry.

- **Headlines (`Space Grotesk`):** Structural, geometric, and aggressive without sacrificing legibility. Reserved for level clear markers, boss title cards, screen anchors, and system-level alerts.
- **Narrative & UI Body (`Inter`):** Clean, neutral, high-legibility sans-serif optimized for reading item descriptions, lore fragments, and ability matrices on mobile touchscreens.
- **Telemetry & Stats (`JetBrains Mono`):** Fixed-width precision tracking for HP/MP numbers, damage output, critical hit percentages, gear attributes, and inventory coordinate indexing. Always set in tabular format to prevent UI jitter during rapid state updates.

## Layout & Spacing

The layout model is anchored to a mobile-first, thumb-driven viewport architecture designed for instant touch response within the lower 60% ergonomic action sector:

- **HUD Grid:** A 4-column compact fluid grid on mobile devices, transitioning to an 8-column layout on landscape and tablet breakpoints. Fixed viewport margins safeguard against device gesture home bars and screen punch-holes.
- **Top Safe Band:** Dedicated to static telemetry meters (Dungeon Floor, Gold Reserves, Health Bar, Shield Core, Arcane Gauge).
- **Center Canvas:** Unobstructed tactical isometric game grid / encounter visualization plane.
- **Bottom Control Deck:** Primary action pad, active ability slots, quick-use consumables, and menu toggles positioned within natural thumb sweep zones.
- **Vertical Metric:** Built on a tight 4px base increment to support compact stat displays and maximum usable screen real estate.

## Elevation & Depth

Visual hierarchy uses a dark-glass optic layering system combined with concentrated micro-luminescence:

- **Ground Zero (Canvas):** Pure base tone `#090D16`. Background environmental rendering and grid lines.
- **Tier 1 (Surface / Passive HUD):** Translucent `#0F172A` mixed at 75% opacity with an 8px backdrop blur (`backdrop-filter: blur(8px)`). Outlined with a razor-thin 1px border of `rgba(245, 158, 11, 0.12)`.
- **Tier 2 (Active Decks / Cards):** `#1E293B` at 85% opacity, 12px backdrop blur. Edges feature crisp structural strokes using `rgba(255, 255, 255, 0.08)`.
- **Tier 3 (Floating Modals / Stat Popovers):** Solid `#0F172A` elevated with a 1px perimeter border tinted to the dominant action color, backed by a dual glow-shadow: a tight 0 0 12px neon halo (20% opacity) layered over a deep 0 12px 32px drop shadow (`rgba(0, 0, 0, 0.8)`).
- **Luminous Highlights:** Critical alerts, available skill actions, and full mana reservoirs emit localized micro-glows (`box-shadow: 0 0 8px currentColor`) without washing out adjacent content.

## Shapes

The design system employs a **Soft (`1`)** shape language (base corner radius of 0.25rem / 4px), balancing ergonomic touch feel with mechanical cybernetic precision.

- **Panels, Action Buttons & Badges:** Use a standardized 4px (`0.25rem`) radius. This avoids harsh brutalist edges while maintaining a tactical, military-grade arcade console feel.
- **Card Containers & Modal Decks:** Use `rounded-lg` (0.5rem / 8px) to softly contain dense internal telemetry grids.
- **Gauges & Stat Pills:** Retain flat vertical edges with subtle 2px end chamfers or 4px radii; avoid fully circular pill shapes to prevent a casual, non-tactical appearance.
- **Item Grid Cells:** Strictly symmetrical 4px rounded squares with crisp inset borders.

## Components

### Buttons & Action Triggers
- **Primary Arcade Action:** Amber gradient fill (`from #F59E0B to #D97706`), bold `Space Grotesk` uppercase text in `#090D16`, 1px gold specular top border. On touch, shifts down 1px with an intense `0 0 16px rgba(245, 158, 11, 0.5)` glow pulse.
- **Secondary Ability Trigger:** Translucent dark cyan base (`rgba(6, 182, 212, 0.15)`), 1px border in `#06B6D4`, text in `#06B6D4`. Cooldown progress displays via a circular radial mask overlay.
- **Ghost Utility:** `#0F172A` with `rgba(255, 255, 255, 0.1)` border and `JetBrains Mono` label text.

### HUD Cards & Inventory Nodes
- **Item Slot Node:** 48x48px or 56x56px touch target. Background of `#0F172A` at 90% opacity, bordered by rarity tier colors (Common: Gray, Rare: Electric Cyan, Legendary: Amber Gold, Cursed: Mystical Purple). Displays stack counters in bottom-right corner using `caption-mono`.
- **Encounter Glass Card:** Floating bottom-sheet modal using Tier 2 glassmorphism, displaying enemy archetype, dynamic HP bar with combat attrition trails, and turn cadence markers.

### Telemetry Bars & Gauges
- **Segmented Health & Mana Gauges:** Micro-segmented visual tracks (10-pip segments) with high-saturation fill (`#EF4444` for HP, `#06B6D4` for Mana). Critical HP state (<25%) activates an alternating crimson glow pulse animation across the screen border.

### Status Badges & Micro-Glow Chips
- Compact stat pills displaying modifier traits (`+14 CRIT`, `POISONED`). Background is a 10% opacity tint of the respective status color with a 1px border, paired with an icon and `label-mono-sm` text.

### Tactile D-Pad & Interaction Disc
- Thumb-friendly bottom-left virtual motion cluster: floating low-opacity slate ring (`rgba(15, 23, 42, 0.6)`) with high-contrast amber direction vectors, giving tactile visual feedback through directional scale dampening when pressed.

### Form Inputs & Terminal Log
- Search/filter bars and command prompts feature a terminal prompt caret (`>`), dark slate sunken background, focused neon amber underline border, and monospaced entry text.