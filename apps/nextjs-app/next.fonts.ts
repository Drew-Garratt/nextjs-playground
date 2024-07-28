import { Afacad, Playfair } from "next/font/google";

// This configures the Next.js Font for Open Sans
// We then export a variable and class name to be used
// within Tailwind (tailwind.config.ts) and Storybook (preview.js)
export const AFACAD = Afacad({
  variable: "--font-afacad",
});

// This configures the Next.js Font for IBM Plex Mono
// We then export a variable and class name to be used
// within Tailwind (tailwind.config.ts) and Storybook (preview.js)
export const PLAYFAIR = Playfair({
  variable: "--font-playfair",
});
