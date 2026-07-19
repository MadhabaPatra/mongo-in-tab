"use client";

import { useState, useRef, createContext, useContext, useEffect } from "react";
import { ChevronRight, ChevronDown } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface JsonTreeProps {
  data: unknown;
}

/* ------------------------------------------------------------------ */
/*  Context — signals global expand/collapse to every node              */
/* ------------------------------------------------------------------ */

interface GlobalToggle {
  expand: boolean; // true = expand all, false = collapse all
  tick: number;    // incremented every time to trigger useEffect
}

const ToggleContext = createContext<GlobalToggle>({ expand: false, tick: 0 });

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
  if (typeof value === "object" && value !== null)
    return Object.keys(value).length;
  return 0;
}

function isCollapsible(value: unknown): boolean {
  const t = getType(value);
  return t === "object" || t === "array";
}

/* ------------------------------------------------------------------ */
/*  Token styles                                                       */
/* ------------------------------------------------------------------ */

const TOK = {
  key:     "text-gray-800",
  string:  "text-green-700",
  number:  "text-blue-600",
  bool:    "text-purple-600",
  null:    "text-purple-600",
  bracket: "text-gray-500",
  colon:   "text-gray-400",
  comma:   "text-gray-400",
};

/* ------------------------------------------------------------------ */
/*  Primitive renderer                                                 */
/* ------------------------------------------------------------------ */

function Primitive({ value }: { value: unknown }) {
  const t = getType(value);

  if (value === null)   return <span className={TOK.null}>null</span>;
  if (t === "boolean")  return <span className={TOK.bool}>{String(value)}</span>;
  if (t === "number")   return <span className={TOK.number}>{String(value)}</span>;
  if (t === "string")   return <span className={TOK.string}>&quot;{String(value)}&quot;</span>;
  return <span>{String(value)}</span>;
}

/* ------------------------------------------------------------------ */
/*  Chevron toggle button                                              */
/* ------------------------------------------------------------------ */

function ChevronBtn({
  collapsed,
  onClick,
}: {
  collapsed: boolean;
  onClick: (e: React.MouseEvent) => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-4 h-4 shrink-0 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
    >
      {collapsed ? (
        <ChevronRight className="h-3 w-3" />
      ) : (
        <ChevronDown className="h-3 w-3" />
      )}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  TreeNode                                                           */
/* ------------------------------------------------------------------ */

function TreeNode({
  property,
  value,
  isLast,
  depth = 0,
}: {
  property?: string;
  value: unknown;
  isLast: boolean;
  depth?: number;
}) {
  const toggle = useContext(ToggleContext);
  const [collapsed, setCollapsed] = useState(true);

  /* respond to global expand/collapse */
  useEffect(() => {
    if (toggle.expand) {
      setCollapsed(false);              // expand all → expand everyone
    } else if (depth > 0) {
      setCollapsed(true);               // collapse all → only nested nodes collapse
    }
    // depth === 0: direct props stay as-is (visible)
  }, [toggle.tick, toggle.expand, depth]);

  const localToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCollapsed((c) => !c);
  };

  const t = getType(value);
  const collapsible = isCollapsible(value);
  const children = countChildren(value);
  const isArr = t === "array";

  /* ── Primitive ── */
  if (!collapsible) {
    return (
      <div className="flex items-center">
        <div className="w-4 shrink-0" />
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

  const obj = !isArr ? (value as Record<string, unknown>) : {};
  const arr = isArr ? (value as unknown[]) : [];
  const keys = !isArr ? Object.keys(obj) : [];

  /* ── Collapsed line ── */
  if (collapsed) {
    return (
      <div className="flex items-center">
        <ChevronBtn collapsed={true} onClick={localToggle} />
        {property !== undefined && (
          <>
            <span className={TOK.key}>&quot;{property}&quot;</span>
            <span className={`${TOK.colon} mx-1`}>:</span>
          </>
        )}
        <button
          type="button"
          onClick={localToggle}
          className="inline-flex items-center gap-0 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded px-1 transition-colors cursor-pointer"
        >
          <span className={TOK.bracket}>{isArr ? "[" : "{"}</span>
          <span className="text-[10px] leading-none mx-0.5">...</span>
          <span className="text-[10px] text-gray-400 mr-0.5">
            {children} {isArr ? "items" : "fields"}
          </span>
          <span className={TOK.bracket}>{isArr ? "]" : "}"}</span>
        </button>
        {!isLast && <span className={TOK.comma}>,</span>}
      </div>
    );
  }

  /* ── Expanded ── */
  return (
    <>
      {/* Open line */}
      <div className="flex items-center">
        <ChevronBtn collapsed={false} onClick={localToggle} />
        {property !== undefined && (
          <>
            <span className={TOK.key}>&quot;{property}&quot;</span>
            <span className={`${TOK.colon} mx-1`}>:</span>
          </>
        )}
        <span className={TOK.bracket}>{isArr ? "[" : "{"}</span>
      </div>

      {/* Children */}
      <div className="pl-4 border-l border-gray-100 ml-1">
        {isArr
          ? arr.map((item, i) => (
              <TreeNode key={i} value={item} isLast={i === arr.length - 1} depth={depth + 1} />
            ))
          : keys.map((k, i) => (
              <TreeNode
                key={k}
                property={k}
                value={obj[k]}
                isLast={i === keys.length - 1}
                depth={depth + 1}
              />
            ))}
      </div>

      {/* Close line */}
      <div className="flex items-center">
        <div className="w-4 shrink-0" />
        <span className={TOK.bracket}>{isArr ? "]" : "}"}</span>
        {!isLast && <span className={TOK.comma}>,</span>}
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Root export                                                        */
/* ------------------------------------------------------------------ */

export function JsonTree({ data }: JsonTreeProps) {
  const [toggle, setToggle] = useState<GlobalToggle>({ expand: false, tick: 0 });
  const [rootCollapsed, setRootCollapsed] = useState(false);

  /* root expands on global expand, but stays open on global collapse */
  const rootDidMount = useRef(false);
  useEffect(() => {
    if (!rootDidMount.current) {
      rootDidMount.current = true;
      return;
    }
    if (toggle.expand) {
      setRootCollapsed(false);
    }
  }, [toggle.tick, toggle.expand]);

  const toggleAll = () => {
    setToggle((prev) => ({ expand: !prev.expand, tick: prev.tick + 1 }));
  };

  const toggleRoot = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRootCollapsed((c) => !c);
  };

  const t = getType(data);

  if (t === "object" || t === "array") {
    const isArr = t === "array";
    const arr = isArr ? (data as unknown[]) : [];
    const obj = !isArr ? (data as Record<string, unknown>) : {};
    const keys = !isArr ? Object.keys(obj) : [];
    const children = isArr ? arr.length : keys.length;

    /* ── Root collapsed ── */
    if (rootCollapsed) {
      return (
        <div className="font-mono text-xs leading-relaxed">
          <div className="flex items-center">
            {/* Global expand/collapse toggle */}
            <button
              type="button"
              onClick={toggleAll}
              className="mr-1 inline-flex items-center justify-center w-5 h-5 rounded border border-gray-200 bg-white text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
              title={toggle.expand ? "Collapse all" : "Expand all"}
            >
              {toggle.expand ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </button>
            <ChevronBtn collapsed={true} onClick={toggleRoot} />
            <button
              type="button"
              onClick={toggleRoot}
              className="inline-flex items-center gap-0 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded px-1 transition-colors cursor-pointer"
            >
              <span className={TOK.bracket}>{isArr ? "[" : "{"}</span>
              <span className="text-[10px] leading-none mx-0.5">...</span>
              <span className="text-[10px] text-gray-400 mr-0.5">
                {children} {isArr ? "items" : "fields"}
              </span>
              <span className={TOK.bracket}>{isArr ? "]" : "}"}</span>
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="font-mono text-xs leading-relaxed">
        {/* Root open line */}
        <div className="flex items-center">
          {/* Global expand/collapse toggle */}
          <button
            type="button"
            onClick={toggleAll}
            className="mr-1 inline-flex items-center justify-center w-5 h-5 rounded border border-gray-200 bg-white text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
            title={toggle.expand ? "Collapse all" : "Expand all"}
          >
            {toggle.expand ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </button>
          <ChevronBtn collapsed={false} onClick={toggleRoot} />
          <span className={TOK.bracket}>{isArr ? "[" : "{"}</span>
        </div>

        {/* Root children */}
        <div className="pl-4 border-l border-gray-100 ml-1">
          <ToggleContext.Provider value={toggle}>
            {isArr
              ? arr.map((item, i) => (
                  <TreeNode key={i} value={item} isLast={i === arr.length - 1} depth={0} />
                ))
              : keys.map((k, i) => (
                  <TreeNode
                    key={k}
                    property={k}
                    value={obj[k]}
                    isLast={i === keys.length - 1}
                    depth={0}
                  />
                ))}
          </ToggleContext.Provider>
        </div>

        {/* Root close line */}
        <div className="flex items-center">
          <div className="w-4 shrink-0" />
          <span className={TOK.bracket}>{isArr ? "]" : "}"}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="font-mono text-xs leading-relaxed">
      <Primitive value={data} />
    </div>
  );
}
