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

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}

export function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatBytes(bytes: number) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (
    Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  );
}

export function formatTimestamp(timestamp: Date) {
  try {
    const now = new Date();
    const diff = now.getTime() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  } catch (e) {
    return "Invalid Date";
  }
}

export function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text);
}

export function getFieldType(value: any): string {
  if (value === null) return "null";
  if (value === undefined) return "undefined";
  if (typeof value === "boolean") return "boolean";
  if (typeof value === "string") {
    if (value.startsWith("ObjectId(")) return "objectid";
    if (value.startsWith("NumberInt(")) return "int32";
    if (value.startsWith("NumberLong(")) return "int64";
    if (value.startsWith("NumberDouble(")) return "double";
    if (value.startsWith("NumberDecimal(")) return "decimal128";
    if (value.startsWith("ISODate(")) return "date";
    if (value.startsWith("Timestamp(")) return "timestamp";
    if (value.startsWith("BinData(")) return "bindata";
    if (value.startsWith("Code(")) return "code";
    if (value.startsWith("/") && value.includes("/")) return "regex";
    if (value.includes("@")) return "string";
    return "string";
  }
  if (Array.isArray(value)) return "array";
  if (typeof value === "object") {
    if (value["$ref"] && value["$id"]) return "dbref";
    if (value["$minKey"]) return "minkey";
    if (value["$maxKey"]) return "maxkey";
    return "object";
  }
  return "unknown";
}
