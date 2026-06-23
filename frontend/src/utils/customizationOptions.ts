export interface FontOption {
  id: string;
  label: string;
  family: string;
  category: 'ats-safe' | 'serif' | 'sans-serif' | 'modern';
  atsSafe: boolean;
  googleFont?: string;
}

export interface ColorOption {
  id: string;
  label: string;
  hex: string;
  group: 'neutral' | 'blue' | 'green' | 'warm' | 'purple' | 'red';
  atsSafe: boolean;
}

export const FONT_OPTIONS: FontOption[] = [
  // ATS-safe system fonts
  { id: 'arial', label: 'Arial', family: 'Arial, Helvetica, sans-serif', category: 'ats-safe', atsSafe: true },
  { id: 'helvetica', label: 'Helvetica', family: 'Helvetica, Arial, sans-serif', category: 'ats-safe', atsSafe: true },
  { id: 'calibri', label: 'Calibri', family: 'Calibri, Candara, sans-serif', category: 'ats-safe', atsSafe: true },
  { id: 'verdana', label: 'Verdana', family: 'Verdana, Geneva, sans-serif', category: 'ats-safe', atsSafe: true },
  { id: 'tahoma', label: 'Tahoma', family: 'Tahoma, Geneva, sans-serif', category: 'ats-safe', atsSafe: true },
  { id: 'times', label: 'Times New Roman', family: '"Times New Roman", Times, serif', category: 'ats-safe', atsSafe: true },
  { id: 'georgia', label: 'Georgia', family: 'Georgia, serif', category: 'ats-safe', atsSafe: true },
  { id: 'garamond', label: 'Garamond', family: 'Garamond, "Times New Roman", serif', category: 'ats-safe', atsSafe: true },
  { id: 'cambria', label: 'Cambria', family: 'Cambria, Georgia, serif', category: 'ats-safe', atsSafe: true },

  // Modern sans-serif (Google Fonts)
  { id: 'inter', label: 'Inter', family: '"Inter", sans-serif', category: 'modern', atsSafe: false, googleFont: 'Inter' },
  { id: 'lato', label: 'Lato', family: '"Lato", sans-serif', category: 'sans-serif', atsSafe: false, googleFont: 'Lato' },
  { id: 'open-sans', label: 'Open Sans', family: '"Open Sans", sans-serif', category: 'sans-serif', atsSafe: false, googleFont: 'Open+Sans' },
  { id: 'roboto', label: 'Roboto', family: '"Roboto", sans-serif', category: 'sans-serif', atsSafe: false, googleFont: 'Roboto' },
  { id: 'source-sans', label: 'Source Sans 3', family: '"Source Sans 3", sans-serif', category: 'sans-serif', atsSafe: false, googleFont: 'Source+Sans+3' },
  { id: 'montserrat', label: 'Montserrat', family: '"Montserrat", sans-serif', category: 'modern', atsSafe: false, googleFont: 'Montserrat' },
  { id: 'poppins', label: 'Poppins', family: '"Poppins", sans-serif', category: 'modern', atsSafe: false, googleFont: 'Poppins' },
  { id: 'nunito', label: 'Nunito', family: '"Nunito", sans-serif', category: 'modern', atsSafe: false, googleFont: 'Nunito' },
  { id: 'raleway', label: 'Raleway', family: '"Raleway", sans-serif', category: 'modern', atsSafe: false, googleFont: 'Raleway' },
  { id: 'work-sans', label: 'Work Sans', family: '"Work Sans", sans-serif', category: 'sans-serif', atsSafe: false, googleFont: 'Work+Sans' },

  // Serif (Google Fonts)
  { id: 'merriweather', label: 'Merriweather', family: '"Merriweather", Georgia, serif', category: 'serif', atsSafe: false, googleFont: 'Merriweather' },
  { id: 'playfair', label: 'Playfair Display', family: '"Playfair Display", Georgia, serif', category: 'serif', atsSafe: false, googleFont: 'Playfair+Display' },
  { id: 'libre-baskerville', label: 'Libre Baskerville', family: '"Libre Baskerville", Georgia, serif', category: 'serif', atsSafe: false, googleFont: 'Libre+Baskerville' },
  { id: 'crimson', label: 'Crimson Text', family: '"Crimson Text", Georgia, serif', category: 'serif', atsSafe: false, googleFont: 'Crimson+Text' },
  { id: 'lora', label: 'Lora', family: '"Lora", Georgia, serif', category: 'serif', atsSafe: false, googleFont: 'Lora' },
  { id: 'eb-garamond', label: 'EB Garamond', family: '"EB Garamond", Garamond, serif', category: 'serif', atsSafe: false, googleFont: 'EB+Garamond' },
];

export const COLOR_OPTIONS: ColorOption[] = [
  // Neutrals
  { id: 'charcoal', label: 'Charcoal', hex: '#1a1a1a', group: 'neutral', atsSafe: true },
  { id: 'slate', label: 'Slate', hex: '#334155', group: 'neutral', atsSafe: true },
  { id: 'gray', label: 'Gray', hex: '#4b5563', group: 'neutral', atsSafe: true },
  { id: 'stone', label: 'Stone', hex: '#57534e', group: 'neutral', atsSafe: true },
  { id: 'black', label: 'Black', hex: '#000000', group: 'neutral', atsSafe: true },

  // Blues
  { id: 'navy', label: 'Navy', hex: '#1e3a5f', group: 'blue', atsSafe: true },
  { id: 'blue', label: 'Blue', hex: '#2563eb', group: 'blue', atsSafe: false },
  { id: 'royal', label: 'Royal', hex: '#1d4ed8', group: 'blue', atsSafe: false },
  { id: 'sky', label: 'Sky', hex: '#0284c7', group: 'blue', atsSafe: false },
  { id: 'teal', label: 'Teal', hex: '#0d9488', group: 'blue', atsSafe: false },
  { id: 'cyan', label: 'Cyan', hex: '#0891b2', group: 'blue', atsSafe: false },

  // Greens
  { id: 'forest', label: 'Forest', hex: '#14532d', group: 'green', atsSafe: true },
  { id: 'green', label: 'Green', hex: '#15803d', group: 'green', atsSafe: false },
  { id: 'emerald', label: 'Emerald', hex: '#059669', group: 'green', atsSafe: false },
  { id: 'olive', label: 'Olive', hex: '#4d7c0f', group: 'green', atsSafe: false },

  // Warm
  { id: 'burgundy', label: 'Burgundy', hex: '#7f1d1d', group: 'warm', atsSafe: true },
  { id: 'rust', label: 'Rust', hex: '#c2410c', group: 'warm', atsSafe: false },
  { id: 'amber', label: 'Amber', hex: '#b45309', group: 'warm', atsSafe: false },
  { id: 'gold', label: 'Gold', hex: '#a16207', group: 'warm', atsSafe: false },
  { id: 'brown', label: 'Brown', hex: '#78350f', group: 'warm', atsSafe: true },

  // Purple
  { id: 'indigo', label: 'Indigo', hex: '#3730a3', group: 'purple', atsSafe: false },
  { id: 'purple', label: 'Purple', hex: '#6d28d9', group: 'purple', atsSafe: false },
  { id: 'violet', label: 'Violet', hex: '#7c3aed', group: 'purple', atsSafe: false },
  { id: 'plum', label: 'Plum', hex: '#86198f', group: 'purple', atsSafe: false },

  // Red
  { id: 'crimson', label: 'Crimson', hex: '#991b1b', group: 'red', atsSafe: true },
  { id: 'red', label: 'Red', hex: '#dc2626', group: 'red', atsSafe: false },
  { id: 'rose', label: 'Rose', hex: '#e11d48', group: 'red', atsSafe: false },
];

export const COLOR_GROUPS: { id: ColorOption['group']; label: string }[] = [
  { id: 'neutral', label: 'Neutrals' },
  { id: 'blue', label: 'Blues & Teals' },
  { id: 'green', label: 'Greens' },
  { id: 'warm', label: 'Warm' },
  { id: 'purple', label: 'Purples' },
  { id: 'red', label: 'Reds' },
];

export const FONT_CATEGORIES: { id: FontOption['category']; label: string }[] = [
  { id: 'ats-safe', label: 'ATS Safe' },
  { id: 'sans-serif', label: 'Sans Serif' },
  { id: 'modern', label: 'Modern' },
  { id: 'serif', label: 'Serif' },
];

export function fontsForMode(atsMode: boolean): FontOption[] {
  return atsMode ? FONT_OPTIONS.filter((f) => f.atsSafe) : FONT_OPTIONS;
}

export function colorsForMode(atsMode: boolean): ColorOption[] {
  return atsMode ? COLOR_OPTIONS.filter((c) => c.atsSafe) : COLOR_OPTIONS;
}

export function googleFontsUrl(): string {
  const families = FONT_OPTIONS
    .filter((f) => f.googleFont)
    .map((f) => `family=${f.googleFont}:wght@400;600;700`)
    .join('&');
  return `https://fonts.googleapis.com/css2?${families}&display=swap`;
}

export function findFontByFamily(family: string): FontOption | undefined {
  return FONT_OPTIONS.find((f) => f.family === family);
}

export function isValidHex(hex: string): boolean {
  return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(hex);
}

export function normalizeHex(hex: string): string {
  if (!hex.startsWith('#')) hex = `#${hex}`;
  if (/^#[0-9A-Fa-f]{3}$/.test(hex)) {
    return `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`.toLowerCase();
  }
  return hex.toLowerCase();
}
