/**
 * MongoDB Shell-Style Query Parser
 *
 * Converts MongoDB shell syntax (where object keys may be unquoted)
 * into valid JSON so it can be parsed with JSON.parse.
 *
 * Examples:
 *   { name: "John" }              → {"name": "John"}
 *   { age: { $gt: 25 } }          → {"age": {"$gt": 25}}
 *   { "status": "active" }        → {"status": "active"}  (already valid)
 *   { $or: [{ a: 1 }, { b: 2 }] } → {"$or": [{"a": 1}, {"b": 2}]}
 *
 * Supports:
 *   - Unquoted keys (JS identifiers and MongoDB operators like $gt)
 *   - Single-quoted strings → double-quoted strings
 *   - Already-valid JSON (passes through unchanged)
 */

const MAX_QUERY_LENGTH = 5000;

class QueryParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "QueryParseError";
  }
}

/**
 * Protect string literals by replacing them with numbered placeholders.
 * Returns the cleaned string and a map to restore them later.
 */
function protectStrings(input: string): {
  cleaned: string;
  restore: (s: string) => string;
} {
  const strings: string[] = [];

  // Match both double-quoted and single-quoted strings,
  // handling escaped quotes inside.
  const regex = /"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/g;

  const cleaned = input.replace(regex, (match) => {
    const index = strings.length;
    strings.push(match);
    return `__STR_${index}__`;
  });

  const restore = (s: string): string =>
    s.replace(/__STR_(\d+)__/g, (_, idx) => strings[Number(idx)]);

  return { cleaned, restore };
}

/**
 * Convert single-quoted strings to double-quoted strings.
 * Must be called AFTER protectStrings restore.
 */
function normalizeQuotes(input: string): string {
  // Replace single-quoted strings with double-quoted
  // Handles escaped single quotes \' → '
  return input.replace(
    /'((?:[^'\\]|\\.)*)'/g,
    (_, content: string) => `"${content.replace(/\\'/g, "'")}"`,
  );
}

/**
 * Quote unquoted object keys.
 * Must be called on a string where all string literals are protected.
 */
function quoteUnquotedKeys(input: string): string {
  // Match positions that look like object keys:
  //   - After { or , (with optional whitespace)
  //   - Followed by a JS identifier or MongoDB operator ($word)
  //   - Then optional whitespace, then :
  return input.replace(
    /([{,]\s*)([$A-Za-z_][$A-Za-z0-9_]*)\s*:/g,
    '$1"$2":',
  );
}

/**
 * Parse a MongoDB shell-style query string into a JavaScript object.
 * Throws QueryParseError if the input is invalid or unsafe.
 */
export function parseMongoQuery(input: string): Record<string, unknown> {
  if (!input || input.trim() === "") {
    throw new QueryParseError("Query is empty");
  }

  const trimmed = input.trim();

  if (trimmed === "{}") {
    return {};
  }

  if (trimmed.length > MAX_QUERY_LENGTH) {
    throw new QueryParseError(
      `Query exceeds maximum length of ${MAX_QUERY_LENGTH} characters`,
    );
  }

  if (!trimmed.startsWith("{")) {
    throw new QueryParseError("Query must start with '{'");
  }

  // 1. Protect existing string literals
  const { cleaned, restore } = protectStrings(trimmed);

  // 2. Quote unquoted keys
  let jsonLike = quoteUnquotedKeys(cleaned);

  // 3. Restore protected strings
  jsonLike = restore(jsonLike);

  // 4. Normalize single quotes to double quotes
  jsonLike = normalizeQuotes(jsonLike);

  // 5. Parse as JSON
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonLike);
  } catch (err: any) {
    // Provide a helpful error message
    const msg = err?.message || "Invalid syntax";
    throw new QueryParseError(`Query syntax error: ${msg}`);
  }

  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new QueryParseError("Query must be an object, not an array or primitive");
  }

  return parsed as Record<string, unknown>;
}

/**
 * Validate a MongoDB shell-style query string.
 * Returns an error message string, or empty string if valid.
 */
export function validateMongoQuery(input: string): string {
  if (!input || input.trim() === "" || input.trim() === "{}") {
    return "";
  }

  try {
    parseMongoQuery(input);
    return "";
  } catch (err: any) {
    return err?.message || "Invalid query";
  }
}

/**
 * Check whether a query string uses MongoDB shell syntax
 * (i.e. has unquoted keys or single-quoted strings).
 */
export function isShellStyleQuery(input: string): boolean {
  const trimmed = input.trim();
  if (trimmed === "{}" || trimmed === "") return false;

  const { cleaned } = protectStrings(trimmed);
  // If quoting unquoted keys changes the string, it's shell-style
  const quoted = quoteUnquotedKeys(cleaned);
  return quoted !== cleaned;
}
