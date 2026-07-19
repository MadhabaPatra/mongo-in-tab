"use client";

import { useState, useCallback } from "react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface JsonTreeProps {
  data: unknown;
  root?: boolean;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getType(value: unknown): string {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  return typeof value;
}

function countChildren(value: unknown): number {
  if (Array.isArray(value)) return value.length;
  if (typeof value === "object" && value !== null) return Object.keys(value).length;
  return 0;
}

function isCollapsible(value: unknown): boolean {
  const t = getType(value);
  return t === "object" || t === "array";
}

/* ------------------------------------------------------------------ */
/*  Token styles — Compass-like palette                                */
/* ------------------------------------------------------------------ */

const TOK = {
  key:    "text-gray-800",
  string: "text-green-700",
  number: "text-blue-600",
  bool:   "text-purple-600",
  null:   "text-purple-600",
  bracket:"text-gray-500",
  colon:  "text-gray-400",
  comma:  "text-gray-400",
  ellipsis:"text-gray-500",
};

/* ------------------------------------------------------------------ */
/*  Primitive renderer                                                 */
/* ------------------------------------------------------------------ */

function Primitive({ value }: { value: unknown }) {
  const t = getType(value);

  if (value === null) {
    return <span className={TOK.null}>null</span>;
  }

  if (t === "boolean") {
    return <span className={TOK.bool}>{String(value)}</span>;
  }

  if (t === "number") {
    return <span className={TOK.number}>{String(value)}</span>;
  }

  if (t === "string") {
    return (
      <span className={TOK.string}>
        &quot;{String(value).replace(/"/g, '\"')}&quot;
      </span>
    );
  }

  return <span>{String(value)}</span>;
}

/* ------------------------------------------------------------------ */
/*  Single node (object / array / primitive)                             */
/* ------------------------------------------------------------------ */

function TreeNode({
  property,
  value,
  isLast,
  defaultCollapsed = true,
}: {
  property?: string;
  value: unknown;
  isLast: boolean;
  defaultCollapsed?: boolean;
}) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const toggle = useCallback(() => setCollapsed((c) => !c), []);

  const t = getType(value);
  const children = countChildren(value);

  /* -------------------- Primitive -------------------- */
  if (!isCollapsible(value)) {
    return (
      <div className="flex items-start">
        {property !== undefined && (
          <>
            <span className={TOK.key}>&quot;{property}&quot;</span>
            <span className={`${TOK.colon} mx-1`}>:</span>
          </>
        )}
        <Primitive value={value} />
        {!isLast && <span className={TOK.comma}>,</span>}
      </div>
    );
  }

  /* -------------------- Array -------------------- */
  if (t === "array") {
    const arr = value as unknown[];
    return (
      <div className="flex items-start">
        {property !== undefined && (
          <>
            <span className={TOK.key}>&quot;{property}&quot;</span>
            <span className={`${TOK.colon} mx-1`}>:</span>
          </>
        )}

        <span className={TOK.bracket}>[</span>

        {collapsed ? (
          <button
            type="button"
            onClick={toggle}
            className="inline-flex items-center gap-1 ml-0.5 text-[10px] text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded px-1 transition-colors"
          >
            <span className={TOK.ellipsis}>...</span>
            <span className="text-gray-400">{arr.length} items</span>
          </button>
        ) : (
          <div className="flex-1">
            {arr.map((item, i) => (
              <div key={i} className="ml-4">
                <TreeNode
                  value={item}
                  isLast={i === arr.length - 1}
                  defaultCollapsed={true}
                />
              </div>
            ))}
          </div>
        )}

        <span className={TOK.bracket}>]</span>
        {!isLast && <span className={TOK.comma}>,</span>}
      </div>
    );
  }

  /* -------------------- Object -------------------- */
  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj);

  return (
    <div className="flex items-start">
      {property !== undefined && (
        <>
          <span className={TOK.key}>&quot;{property}&quot;</span>
          <span className={`${TOK.colon} mx-1`}>:</span>
        </>
      )}

      <span className={TOK.bracket}>{`{`}</span>

      {collapsed ? (
        <button
          type="button"
          onClick={toggle}
          className="inline-flex items-center gap-1 ml-0.5 text-[10px] text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded px-1 transition-colors"
        >
          <span className={TOK.ellipsis}>...</span>
          <span className="text-gray-400">{children} fields</span>
        </button>
      ) : (
        <div className="flex-1">
          {keys.map((k, i) => (
            <div key={k} className="ml-4">
              <TreeNode
                property={k}
                value={obj[k]}
                isLast={i === keys.length - 1}
                defaultCollapsed={true}
              />
            </div>
          ))}
        </div>
      )}

      <span className={TOK.bracket}>{`}`}</span>
      {!isLast && <span className={TOK.comma}>,</span>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Root export — wraps each document                                  */
/* ------------------------------------------------------------------ */

export function JsonTree({ data, root = false }: JsonTreeProps) {
  const t = getType(data);

  if (t === "object" || t === "array") {
    return (
      <div className="font-mono text-xs leading-relaxed">
        <TreeNode
          value={data}
          isLast={true}
          defaultCollapsed={false}      // root is expanded
        />
      </div>
    );
  }

  return (
    <div className="font-mono text-xs leading-relaxed">
      <Primitive value={data} />
    </div>
  );
}
