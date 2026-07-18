/**
 * Format bytes into human-readable string (e.g., 1.5 MB)
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0 || bytes == null) return "0 B";

  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${Number.parseFloat((bytes / k ** i).toFixed(decimals))} ${sizes[i]}`;
}

/**
 * Format a number with compact notation (e.g., 1.2k, 3.5M)
 */
export function formatNumber(num: number): string {
  if (num === 0 || num == null) return "0";

  const abs = Math.abs(num);
  if (abs < 1000) return String(num);
  if (abs < 1_000_000) return `${(num / 1000).toFixed(1)}k`;
  if (abs < 1_000_000_000) return `${(num / 1_000_000).toFixed(1)}M`;

  return `${(num / 1_000_000_000).toFixed(1)}B`;
}
