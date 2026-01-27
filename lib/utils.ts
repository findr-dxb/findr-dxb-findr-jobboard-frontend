import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const TOP_200_COMPANIES = [
  // Example entries, replace/expand as needed
  "Tech Solutions LLC",
  "Emirates Group",
  "Dubai Holdings",
  "Emaar Properties",
  "Majid Al Futtaim",
  "Etisalat",
  "DP World",
  "Mashreq Bank",
  "Al-Futtaim Group",
  "Jumeirah Group",
];

// normalize and validate UAE mobile
export function normalizeUAE(phone: string | null | undefined): string | null {
  if (!phone) return null;

  let s = phone.trim();

  s = s.replace(/[\s\-().]/g, ''); // remove common separators

  if (s.startsWith('00')) s = '+' + s.slice(2);

  if (s.startsWith('+971') && /^\+9715\d{8}$/.test(s)) return s;

  if (/^05\d{8}$/.test(s)) return '+971' + s.slice(1); // drop leading 0

  return null; // invalid
}