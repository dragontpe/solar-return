export interface Branding {
  companyName: string;
  tagline: string;
  contact: string;    // email, phone, or website
}

const STORAGE_KEY = 'solar-return-branding';

export function loadBranding(): Branding {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return { companyName: '', tagline: '', contact: '' };
}

export function saveBranding(b: Branding) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(b));
}
