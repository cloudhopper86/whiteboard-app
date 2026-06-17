export const FONT_OPTIONS = [
  { label: 'Inter', value: 'Inter' },
  { label: 'Roboto', value: 'Roboto' },
  { label: 'Open Sans', value: 'Open Sans' },
  { label: 'Montserrat', value: 'Montserrat' },
  { label: 'Playfair Display', value: 'Playfair Display' },
  { label: 'Lato', value: 'Lato' },
  { label: 'Poppins', value: 'Poppins' },
  { label: 'Merriweather', value: 'Merriweather' },
];

const loaded = new Set<string>();

export function loadFont(family: string): void {
  if (loaded.has(family)) return;
  loaded.add(family);
  const url = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:ital,wght@0,400;0,700;1,400;1,700&display=swap`;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = url;
  document.head.appendChild(link);
}

export function preloadAllFonts(): void {
  FONT_OPTIONS.forEach((f) => loadFont(f.value));
}
