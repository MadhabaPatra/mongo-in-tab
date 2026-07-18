/**
 * MongoDB Query Sanitizer
 *
 * Prevents NoSQL injection by blocking dangerous operators and
 * prototype pollution keys while preserving legitimate MongoDB query syntax.
 */

const DANGEROUS_OPERATORS = new Set([
  "$where",
  "$eval",
  "$function",
  "$accumulator",
  "$accumulator",
  "$expr",
  "$regex",
  "$options",
]);

const PROTOTYPE_POLLUTION_KEYS = new Set([
  "__proto__",
  "constructor",
  "prototype",
]);

const MAX_QUERY_DEPTH = 10;
const MAX_QUERY_KEYS = 200;

class QuerySanitizationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "QuerySanitizationError";
  }
}

/**
 * Recursively sanitize a parsed MongoDB query object.
 * Returns a cleaned copy or throws QuerySanitizationError.
 */
export function sanitizeQuery(
  query: unknown,
  depth: number = 0,
  keyCount: { value: number } = { value: 0 },
): unknown {
  if (depth > MAX_QUERY_DEPTH) {
    throw new QuerySanitizationError(
      `Query exceeds maximum nesting depth (${MAX_QUERY_DEPTH})`,
    );
  }

  if (query === null || typeof query !== "object") {
    throw new QuerySanitizationError("Query must be a valid JSON object");
  }

  if (Array.isArray(query)) {
    return query.map((item) => sanitizeQuery(item, depth + 1, keyCount));
  }

  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(query as Record<string, unknown>)) {
    keyCount.value++;
    if (keyCount.value > MAX_QUERY_KEYS) {
      throw new QuerySanitizationError(
        `Query exceeds maximum number of keys (${MAX_QUERY_KEYS})`,
      );
    }

    // Block prototype pollution keys
    if (PROTOTYPE_POLLUTION_KEYS.has(key)) {
      throw new QuerySanitizationError(
        `Prohibited key detected in query: "${key}"`,
      );
    }

    // Block dangerous operators
    if (DANGEROUS_OPERATORS.has(key)) {
      throw new QuerySanitizationError(
        `Dangerous operator detected in query: "${key}"`,
      );
    }

    // Sanitize nested objects/arrays
    if (value !== null && typeof value === "object") {
      result[key] = sanitizeQuery(value, depth + 1, keyCount);
    } else {
      result[key] = value;
    }
  }

  return result;
}

/**
 * Validate and parse a MongoDB query string.
 * Returns the sanitized query object or throws QuerySanitizationError.
 */
export function parseAndSanitizeQuery(queryString: string): Record<string, unknown> {
  if (!queryString || queryString.trim() === "{}") {
    return {};
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(queryString);
  } catch {
    throw new QuerySanitizationError("Invalid JSON format in query string");
  }

  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new QuerySanitizationError("Query must be a JSON object, not an array or primitive");
  }

  return sanitizeQuery(parsed) as Record<string, unknown>;
}
