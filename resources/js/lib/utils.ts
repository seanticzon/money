import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Handle both string URLs and route objects from Wayfinder
export function resolveUrl(url: string | { url: string } | undefined): string {
  if (!url) return '/';
  const urlString = typeof url === 'string' ? url : url.url;
  return urlString.startsWith('/') ? urlString : `/${urlString}`;
}

export function isSameUrl(url1: string | { url: string }, url2: string | { url: string }): boolean {
  const normalize = (url: string | { url: string }) => {
    const urlString = typeof url === 'string' ? url : url.url;
    return urlString.replace(/\/+$/, '').toLowerCase();
  };
  return normalize(url1) === normalize(url2);
}