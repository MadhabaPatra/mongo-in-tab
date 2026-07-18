import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const MONGODB_SCHEME_REGEX = /^mongodb(\+srv)?:\/\//i;
const SUSPICIOUS_URL_PATTERNS = [
  /\$\{/,
  /`\$\{/,
  /\$\(\(/,
  /\beval\b/i,
  /\bwhere\b/i,
  /javascript:/i,
];

export function validateUrl(url: string): string {
  if (!url || !url.trim()) {
    return "Please enter a valid MongoDB connection string";
  }

  const trimmed = url.trim();

  if (!MONGODB_SCHEME_REGEX.test(trimmed)) {
    return "Please enter a valid MongoDB connection string (must start with mongodb:// or mongodb+srv://)";
  }

  // Parse URL structure
  try {
    const urlObj = new URL(trimmed);
    const hostname = urlObj.hostname;

    if (!hostname) {
      return "Connection string is missing a valid host";
    }

    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return "Localhost connections are not supported";
    }

    if (hostname.length > 253) {
      return "Host name is too long";
    }

    // Block suspicious patterns that could indicate injection attempts
    for (const pattern of SUSPICIOUS_URL_PATTERNS) {
      if (pattern.test(trimmed)) {
        return "Connection string contains invalid characters";
      }
    }

    // Block newlines and control characters
    if (/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/.test(trimmed)) {
      return "Connection string contains invalid characters";
    }
  } catch {
    return "Please enter a valid MongoDB connection string";
  }

  return "";
}

const MAX_QUERY_STRING_LENGTH = 5000;

export function validateQueryString(queryString: string): string {
  if (!queryString) {
    return "";
  }

  const trimmed = queryString.trim();

  if (trimmed === "{}") {
    return "";
  }

  if (trimmed.length > MAX_QUERY_STRING_LENGTH) {
    return `Query exceeds maximum length of ${MAX_QUERY_STRING_LENGTH} characters`;
  }

  if (!trimmed.startsWith("{")) {
    return "Query must be a valid JSON object starting with '{'";
  }

  try {
    const parsed = JSON.parse(trimmed);
    if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
      return "Query must be a JSON object, not an array or primitive";
    }
  } catch {
    return "Query is not valid JSON";
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
  } catch {
    return "Invalid Date";
  }
}

export function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text);
}

export function getFieldType(value: unknown): string {
  if (value === null) return "null";
  if (value === undefined) return "undefined";

  const t = typeof value;
  if (t === "boolean") return "boolean";
  if (t === "string") return "string";
  if (t === "number") return "double"; // JS numbers are IEEE 754 doubles
  if (Array.isArray(value)) return "array";

  if (t === "object" && value !== null) {
    const v = value as Record<string, unknown>;
    if ("$oid" in v) return "objectid";
    if ("$numberDecimal" in v) return "decimal128";
    if ("$date" in v) return "date";
    if ("$timestamp" in v) return "timestamp";
    if ("$binary" in v) return "bindata";
    if ("$code" in v) return "code";
    if ("$regex" in v) return "regex";
    if ("$minKey" in v) return "minkey";
    if ("$maxKey" in v) return "maxkey";
    if ("$undefined" in v) return "undefined";
    if ("$dbPointer" in v) return "dbref";
    if ("$symbol" in v) return "symbol";
    if ("$ref" in v && "$id" in v) return "dbref";
    return "object";
  }

  return "unknown";
}

/**
 * Extract a plain display value from an EJSON-serialized value.
 */
export function getEJSONValue(value: unknown): unknown {
  if (value === null || value === undefined) return value;
  if (typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map(getEJSONValue);

  const v = value as Record<string, unknown>;
  if ("$oid" in v) return v.$oid;
  if ("$numberDecimal" in v) return v.$numberDecimal;
  if ("$date" in v) return v.$date;
  if ("$timestamp" in v) return v.$timestamp;
  if ("$binary" in v) {
    const bin = v.$binary as Record<string, string>;
    return bin.base64 ?? "Binary";
  }
  if ("$code" in v) return v.$code;
  if ("$regex" in v) return v.$regex;
  if ("$minKey" in v) return "MinKey";
  if ("$maxKey" in v) return "MaxKey";
  if ("$undefined" in v) return "undefined";
  if ("$dbPointer" in v) return v.$dbPointer;
  if ("$symbol" in v) return v.$symbol;
  if ("$ref" in v && "$id" in v) {
    const ref = v as Record<string, unknown>;
    return `${ref.$ref}(${JSON.stringify(getEJSONValue(ref.$id))})`;
  }

  // Plain object — recursively flatten
  const result: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(value)) {
    result[key] = getEJSONValue(val);
  }
  return result;
}

const BSON_TYPE_DISPLAY_NAMES: Record<string, string> = {
  objectid: "ObjectId",
  string: "String",
  int32: "Int32",
  int64: "Int64",
  double: "Double",
  decimal128: "Decimal128",
  date: "Date",
  timestamp: "Timestamp",
  boolean: "Boolean",
  array: "Array",
  object: "Object",
  null: "Null",
  undefined: "Undefined",
  bindata: "Binary",
  code: "Code",
  regex: "Regex",
  minkey: "MinKey",
  maxkey: "MaxKey",
  dbref: "DBRef",
  symbol: "Symbol",
  unknown: "Unknown",
};

export function getFieldTypeDisplayName(value: unknown): string {
  const type = getFieldType(value);
  return BSON_TYPE_DISPLAY_NAMES[type] || type;
}

export function getDatabaseLink(
  connectionId?: string | null,
  database?: string | null,
): string {
  if (connectionId && database) {
    return `/app/collections?connectionId=${connectionId}&database=${database}`;
  }
  return "#";
}

/**
 * Masks credentials in a MongoDB connection string.
 * mongodb://user:pass@host:27017/db → mongodb://****@host:27017/db
 */
export function maskMongoUrl(url: string): string {
  if (!url) return "";
  try {
    // Mask credentials between :// and @
    return url.replace(/^(mongodb(?:\+srv)?:\/\/)[^@]+@/, "$1****@");
  } catch {
    return url;
  }
}
