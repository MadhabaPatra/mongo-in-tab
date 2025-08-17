import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function validateUrl(url: string) {
  if (!url.trim()) {
    return "";
  }

  if (url.includes("localhost") || url.includes("127.0.0.1")) {
    return "Localhost connections are not supported";
  }

  if (!url.startsWith("mongodb://") && !url.startsWith("mongodb+srv://")) {
    return "Please enter a valid MongoDB connection string";
  }

  return "";
}
