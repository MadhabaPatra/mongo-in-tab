"use client";

import { useState } from "react";
import { ChevronRight, ChevronDown } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface DocumentCompactTreeProps {
  data: Record<string, unknown>;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getType(value: unknown): string {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  return typeof value;
}

function isCollapsible(value: unknown): boolean {
  if (isObjectId(value) || isDate(value)) return false;
  const t = getType(value);
  return t === "object" || t === "array";
}

/* ------------------------------------------------------------------ */
/*  EJSON helpers                                                      */
/* ------------------------------------------------------------------ */

function isObjectId(value: unknown): boolean {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return Object.keys(v).length === 1 && "$oid" in v;
}

function isDate(value: unknown): boolean {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return Object.keys(v).length === 1 && "$date" in v;
}

function getDisplayValue(value: unknown): string {
  if (value === null) return "null";
  if (typeof value === "boolean") return String(value);
  if (typeof value === "number") return String(value);
  if (typeof value === "string") return `"${value}"`;
  if (isObjectId(value)) {
    const v = value as Record<string, string>;
    return `ObjectId('${v.$oid}')`;
  }
  if (isDate(value)) {
    const v = value as Record<string, string>;
    return v.$date;
  }
  if (Array.isArray(value)) return `Array[${value.length}]`;
  if (typeof value === "object") {
    const keys = Object.keys(value);
    return `Object{${keys.length}}`;
  }
  return String(value);
}

/* ------------------------------------------------------------------ */
/*  Value style by type                                                */
/* ------------------------------------------------------------------ */

function getValueClass(value: unknown): string {
  if (value === null) return "text-gray-400 italic";
  if (typeof value === "boolean") return "text-gray-700";
  if (typeof value === "number") return "text-blue-600";
  if (typeof value === "string") return "text-green-700";
  if (isObjectId(value)) return "text-orange-600";
  if (isDate(value)) return "text-blue-600";
  if (Array.isArray(value)) return "text-purple-600";
  if (typeof value === "object") return "text-gray-500";
  return "text-gray-700";
}

const INDENT_PX = 12; // matches w-3 (12px)

/* ------------------------------------------------------------------ */
/*  Inline tree node                                                   */
/* ------------------------------------------------------------------ */

function InlineNode({
  property,
  value,
  depth = 0,
}: {
  property: string;
  value: unknown;
  depth?: number;
}) {
  const [collapsed, setCollapsed] = useState(true);
  const toggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCollapsed((c) => !c);
  };

  const t = getType(value);
  const collapsible = isCollapsible(value);
  const isArr = t === "array";

  const indent = depth * INDENT_PX;

  /* ── Primitive (no chevron) ── */
  if (!collapsible) {
    return (
      <div className="flex items-start leading-6" style={{ paddingLeft: indent }}>
        {/* invisible spacer same width as chevron so keys align */}
        <div className="w-3 shrink-0" />
        <span className="font-semibold text-gray-800">{property}</span>
        <span className="text-gray-400 mx-1">:</span>
        <span className={getValueClass(value)}>{getDisplayValue(value)}</span>
      </div>
    );
  }

  const obj = !isArr ? (value as Record<string, unknown>) : {};
  const arr = isArr ? (value as unknown[]) : [];
  const keys = !isArr ? Object.keys(obj) : [];
  const children = isArr ? arr.length : keys.length;

  /* ── Collapsed ── */
  if (collapsed) {
    return (
      <div className="flex items-start leading-6" style={{ paddingLeft: indent }}>
        <button
          type="button"
          onClick={toggle}
          className="shrink-0 inline-flex items-center justify-center w-3 h-6 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
        >
          <ChevronRight className="h-3 w-3" />
        </button>
        <span className="font-semibold text-gray-800">{property}</span>
        <span className="text-gray-400 mx-1">:</span>
        <button
          type="button"
          onClick={toggle}
          className="text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
        >
          {isArr ? `Array[${children}]` : `Object{${children}}`}
        </button>
      </div>
    );
  }

  /* ── Expanded ── */
  return (
    <>
      {/* Open line */}
      <div className="flex items-start leading-6" style={{ paddingLeft: indent }}>
        <button
          type="button"
          onClick={toggle}
          className="shrink-0 inline-flex items-center justify-center w-3 h-6 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
        >
          <ChevronDown className="h-3 w-3" />
        </button>
        <span className="font-semibold text-gray-800">{property}</span>
        <span className="text-gray-400 mx-1">:</span>
        <span className="text-gray-500">{isArr ? `Array[${children}]` : `Object{${children}}`}</span>
      </div>

      {/* Children */}
      <div style={{ paddingLeft: (depth + 1) * INDENT_PX }}>
        {isArr
          ? arr.map((item, i) => (
              <PrimitiveArrayItem
                key={i}
                index={i}
                value={item}
              />
            ))
          : keys.map((k) => (
              <InlineNode
                key={k}
                property={k}
                value={obj[k]}
                depth={depth + 1}
              />
            ))}
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Primitive inside an expanded array                                 */
/* ------------------------------------------------------------------ */

function PrimitiveArrayItem({
  index,
  value,
}: {
  index: number;
  value: unknown;
}) {
  return (
    <div className="flex items-start leading-6">
      <span className="text-gray-400 mr-1">{index}:</span>
      <span className={getValueClass(value)}>{getDisplayValue(value)}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Root export                                                        */
/* ------------------------------------------------------------------ */

export function DocumentCompactTree({ data }: DocumentCompactTreeProps) {
  const keys = Object.keys(data);

  return (
    <div className="font-mono text-xs">
      {keys.map((k) => (
        <InlineNode key={k} property={k} value={data[k]} />
      ))}
    </div>
  );
}
