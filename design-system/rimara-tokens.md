# Rimara Website Design System

## Brand Colours

- `--rimara-ivory: #F7F3EA` - primary website background.
- `--rimara-ink: #11110F` - primary text and primary buttons.
- `--rimara-stone: #E7E1D6` - secondary background blocks.
- `--rimara-charcoal: #1D1C19` - dark premium sections.
- `--rimara-border: #CFC7BA` - all hairline borders.
- `--rimara-copper: #B56A2A` - restrained CTA accent.
- `--rimara-gold: #9A6A36` - rare detail accent.
- `--rimara-moss: #4E5944` - mood sections only.
- `--rimara-sand: #C8B79C` - mood sections only.

## Product Colours

- Air That Stays: `#7A4520`, `#1C2B1E`
- Last Light: `#E0A040`, `#C89070`
- Wild Air: `#8AB0C8`, `#B8CAD4`
- Quiet Bloom: `#D4A0A8`, `#D8D4E8`

Use product colours as small scent accents: card accent lines, metadata cues, hover details and product modules. Do not flood full pages.

## Typography

- Headlines: `"Rasputin", "Cormorant Garamond", "Bodoni Moda", "Playfair Display", serif`
- Body: `"Inter", "Helvetica Neue", Arial, sans-serif`
- Labels: `"IBM Plex Mono", "Space Mono", monospace`

Rasputin is for emotion and storytelling: H1, H2, H3, product names and editorial headlines. Body, navigation, buttons, forms, ingredients, support and footer links use body or label fonts.

TODO: Add a licensed local Rasputin font file and load it with `@font-face` and `font-display: swap`.

## Type Scale

- H1: 40-96px, line-height 0.98
- H2: 34-64px, line-height 1.05
- H3: 26-40px, line-height 1.1
- Body: 16-18px, line-height 1.65-1.7
- Labels: 11-13px, uppercase, letter-spacing 0.08em

## Spacing And Grid

Spacing scale: 8, 16, 24, 32, 48, 64, 96, 128.

- Desktop gutters: 48-72px
- Tablet gutters: 32px
- Mobile gutters: 20px
- Desktop grid: 12-column intent through shared sections
- Tablet grid: 8-column intent
- Mobile grid: 4-column intent

Use 1px borders only, always `--rimara-border`.

## Header

One shared sticky header:

- Left: Home, Shop, Concept, Diagnostic, Story, Perfumers, Contact
- Centre: `Rimara.svg`
- Right: Search, Account, Cart
- Shop dropdown: Fragrances and Discovery Pack
- Desktop height: 72px plus announcement
- Mobile height: 64px

Mobile uses a full-width menu reveal through the shared header focus state. All tap targets are at least 44px.

## Footer

One shared footer:

- Column 1: `Sillage__logo.svg`, "Crafting the Air Around You.", parent-brand line
- Column 2: Shop
- Column 3: Explore
- Column 4: Support
- Column 5: Newsletter

Copyright: `© Rimara / Sillage. All rights reserved.`

## Buttons And Forms

Primary: ink background, ivory text. Secondary: transparent with ink border. Accent: copper background, ivory text. Buttons use uppercase label typography and 44px minimum height.

Forms use visible labels, transparent fields, bottom borders, 48px minimum input height and visible focus outlines.

## Product Cards

Reusable product card includes image, mood/time line, product name, category/gender, price where available and restrained product-colour accent. Hover scale is capped at 3%.

## Product Detail

Template order:

1. Product gallery
2. Product name
3. Mood line
4. Category / gender / price
5. Size and quantity
6. Add to bag
7. Notes pyramid
8. Scent story
9. How to wear
10. Ingredients
11. Shipping / returns
12. Related fragrances
13. Discovery Pack CTA

## Image Ratios

- Product card: 4:5
- Product hero: 4:5 or 1:1
- Editorial banner: 16:9
- Story image: 3:2
- Mobile hero: 4:5

Use meaningful alt text. Lazy-load images below the fold.

## Motion

Motion should feel like air moving: soft fades, gentle hover scale, 300-500ms timing. Respect `prefers-reduced-motion`.

## Accessibility

Keyboard focus must be visible. Use real buttons for actions and real links for navigation. Form fields require labels. Avoid low-contrast small text. Keep mobile tap targets at least 44px.
