"use client";

import React, { useMemo, useState, useRef, useEffect } from "react";
import { cn } from "../../lib/cn";

// ── Types ─────────────────────────────────────────────────────────────────────

export type FilterType = "text" | "multi" | "none";

export interface ColumnDef<T> {
  key: string;
  header: string;
  accessor: (row: T) => string | number | null | undefined;
  render?: (row: T) => React.ReactNode;
  filterType?: FilterType;
  multiLabel?: (value: string) => string;
  sortable?: boolean;
  align?: "left" | "right" | "center";
  nowrap?: boolean;
}

type SortState = { key: string; dir: "asc" | "desc" } | null;
type FilterState = Record<string, string | string[]>;

export interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  highlightRow?: (row: T) => boolean;
  emptyMessage?: string;
  defaultSort?: { key: string; dir: "asc" | "desc" };
}

// ── Component ─────────────────────────────────────────────────────────────────

function DataTableInner<T>({
  columns,
  rows,
  rowKey,
  onRowClick,
  highlightRow,
  emptyMessage = "No rows",
  defaultSort,
}: DataTableProps<T>) {
  const [sort, setSort] = useState<SortState>(defaultSort ?? null);
  const [filters, setFilters] = useState<FilterState>({});
  const [openFilterKey, setOpenFilterKey] = useState<string | null>(null);

  const toggleSort = React.useCallback((key: string) => {
    setSort((prev) => {
      if (!prev || prev.key !== key) return { key, dir: "asc" };
      if (prev.dir === "asc") return { key, dir: "desc" };
      return null;
    });
  }, []);

  const filtered = useMemo(() => {
    return rows.filter((row) => {
      for (const col of columns) {
        const f = filters[col.key];
        if (f == null) continue;
        if (typeof f === "string" && f === "") continue;
        if (Array.isArray(f) && f.length === 0) continue;
        const value = col.accessor(row);
        const valueStr = value == null ? "" : String(value);
        if (col.filterType === "text") {
          if (!valueStr.toLowerCase().includes(String(f).toLowerCase())) return false;
        } else if (col.filterType === "multi") {
          if (!(f as string[]).includes(valueStr)) return false;
        }
      }
      return true;
    });
  }, [rows, columns, filters]);

  const sorted = useMemo(() => {
    if (!sort) return filtered;
    const col = columns.find((c) => c.key === sort.key);
    if (!col) return filtered;
    const dirMul = sort.dir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const va = col.accessor(a);
      const vb = col.accessor(b);
      if (va == null && vb == null) return 0;
      if (va == null) return 1;
      if (vb == null) return -1;
      if (typeof va === "number" && typeof vb === "number") return (va - vb) * dirMul;
      return String(va).localeCompare(String(vb), undefined, { sensitivity: "base" }) * dirMul;
    });
  }, [filtered, sort, columns]);

  const hasActiveFilters = Object.values(filters).some((v) =>
    Array.isArray(v) ? v.length > 0 : v != null && v !== ""
  );

  return (
    <div
      className="overflow-hidden rounded-xl"
      style={{ border: "1px solid var(--color-border)", background: "color-mix(in oklab, var(--color-surface) 55%, transparent)" }}
    >
      {hasActiveFilters && (
        <div className="flex items-center gap-3 px-4 py-2 font-mono text-[11px] text-text-2"
          style={{ borderBottom: "1px solid var(--color-border)", background: "var(--color-surface)" }}>
          <span>{sorted.length} of {rows.length}</span>
          <button type="button" onClick={() => setFilters({})}
            className="cursor-pointer border-0 bg-transparent p-0 text-hud-cyan hover:underline" style={{ font: "inherit" }}>
            clear filters
          </button>
        </div>
      )}
      <div className="w-full overflow-x-auto">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr>
              {columns.map((col) => {
                const sortActive = sort?.key === col.key;
                const sortArrow = sortActive ? (sort!.dir === "asc" ? "↑" : "↓") : "↕";
                const filterValue = filters[col.key];
                const filterActive = Array.isArray(filterValue)
                  ? filterValue.length > 0
                  : filterValue != null && filterValue !== "";
                const canSort = col.sortable !== false;
                const canFilter = col.filterType && col.filterType !== "none";
                return (
                  <th key={col.key}
                    className="sticky top-0 z-10 whitespace-nowrap px-4 py-3 font-mono text-[10.5px] font-medium uppercase tracking-[0.1em] text-text-3"
                    style={{ textAlign: col.align ?? "left", background: "var(--color-surface)", borderBottom: "1px solid var(--color-border-strong)" }}>
                    <div className="flex items-center gap-1.5" style={{ justifyContent: col.align === "right" ? "flex-end" : "flex-start" }}>
                      {canSort ? (
                        <button type="button" onClick={() => toggleSort(col.key)}
                          className="inline-flex cursor-pointer items-center gap-1 border-0 bg-transparent p-0 uppercase tracking-[inherit] text-inherit transition-colors hover:text-text-1"
                          style={{ font: "inherit" }}>
                          {col.header}
                          <span className="text-[9px]" style={{ color: sortActive ? "var(--color-primary)" : "var(--color-text-3)", opacity: sortActive ? 1 : 0.5 }}>{sortArrow}</span>
                        </button>
                      ) : col.header}
                      {canFilter && (
                        <FilterPopover
                          columnKey={col.key}
                          columnType={col.filterType!}
                          rows={rows}
                          accessor={col.accessor}
                          multiLabel={col.multiLabel}
                          value={filterValue}
                          active={filterActive}
                          open={openFilterKey === col.key}
                          onOpen={(isOpen) => setOpenFilterKey(isOpen ? col.key : null)}
                          onChange={(v) =>
                            setFilters((prev) => {
                              const next = { ...prev };
                              if (v == null || (Array.isArray(v) && v.length === 0) || v === "") {
                                delete next[col.key];
                              } else {
                                next[col.key] = v;
                              }
                              return next;
                            })
                          }
                        />
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-4 py-14 text-center text-sm text-text-2">
                  {emptyMessage}
                </td>
              </tr>
            )}
            {sorted.map((row) => {
              const isHighlighted = highlightRow?.(row);
              return (
                <tr
                  key={rowKey(row)}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={cn(
                    "transition-colors",
                    onRowClick && "cursor-pointer",
                    isHighlighted ? "bg-hud-cyan/[0.07]" : "even:bg-white/[0.018]",
                    "hover:bg-hud-cyan/[0.06]"
                  )}
                >
                  {columns.map((col, ci) => (
                    <td key={col.key}
                      className={cn("px-4 py-3 align-middle", ci === 0 ? "text-text-1" : "text-text-2")}
                      style={{ borderBottom: "1px solid var(--color-border-subtle)", textAlign: col.align ?? "left", whiteSpace: col.nowrap ? "nowrap" : undefined }}>
                      {col.render ? col.render(row) : (col.accessor(row) ?? "—")}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export const DataTable = React.memo(DataTableInner) as typeof DataTableInner;

// ── Filter popover ────────────────────────────────────────────────────────────

interface FilterPopoverProps<T> {
  columnKey: string;
  columnType: FilterType;
  rows: T[];
  accessor: (row: T) => string | number | null | undefined;
  multiLabel?: (value: string) => string;
  value: string | string[] | undefined;
  active: boolean;
  open: boolean;
  onOpen: (open: boolean) => void;
  onChange: (value: string | string[] | null) => void;
}

function FilterPopover<T>({
  columnType, rows, accessor, multiLabel,
  value, active, open, onOpen, onChange,
}: FilterPopoverProps<T>) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, onOpen]);

  const uniqueValues = useMemo(() => {
    if (columnType !== "multi") return [];
    const set = new Set<string>();
    for (const row of rows) {
      const v = accessor(row);
      set.add(v == null ? "" : String(v));
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
  }, [columnType, rows, accessor]);

  const multiValue = (Array.isArray(value) ? value : []) as string[];

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-flex" }}>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onOpen(!open); }}
        style={{
          background: active ? "var(--color-primary-surface)" : "transparent",
          border: active ? "1px solid var(--color-primary-border)" : "1px solid transparent",
          borderRadius: "4px", cursor: "pointer", padding: "2px 4px",
          color: active ? "var(--color-primary)" : "var(--color-text-3)",
          display: "inline-flex", alignItems: "center",
        }}
        aria-label="Filter" title="Filter"
      >
        <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 3h12l-4.5 5.5V13l-3 1.5V8.5z" />
        </svg>
      </button>
      {open && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: "absolute", top: "100%", right: 0, marginTop: "6px",
            background: "var(--color-surface-elevated)", border: "1px solid var(--color-border-strong)",
            borderRadius: "8px", padding: "8px",
            minWidth: "210px", maxHeight: "300px", overflowY: "auto",
            boxShadow: "0 16px 48px rgba(0,0,0,0.7)",
            zIndex: 40, textTransform: "none", letterSpacing: "normal",
            fontWeight: "normal", display: "flex", flexDirection: "column", gap: "6px",
          }}
        >
          {columnType === "text" ? (
            <input
              type="text" placeholder="contains…"
              value={(value as string) ?? ""}
              onChange={(e) => onChange(e.target.value === "" ? null : e.target.value)}
              style={{
                width: "100%", padding: "6px 8px", fontSize: "12px",
                background: "var(--color-bg)", border: "1px solid var(--color-border-strong)",
                borderRadius: "5px", color: "var(--color-text-1)",
                fontFamily: "var(--font-mono)", outline: "none",
              }}
              onClick={(e) => e.stopPropagation()}
              autoFocus
            />
          ) : (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "8px" }}>
                <button type="button" onClick={() => onChange(uniqueValues)}
                  style={{ background: "transparent", border: 0, cursor: "pointer", color: "var(--color-text-2)", fontSize: "10.5px", padding: 0, fontFamily: "var(--font-mono)" }}>
                  select all
                </button>
                <button type="button" onClick={() => onChange(null)}
                  style={{ background: "transparent", border: 0, cursor: "pointer", color: "var(--color-text-2)", fontSize: "10.5px", padding: 0, fontFamily: "var(--font-mono)" }}>
                  clear
                </button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                {uniqueValues.map((v) => {
                  const checked = multiValue.includes(v);
                  const label = v === "" ? "(empty)" : (multiLabel ? multiLabel(v) : v);
                  return (
                    <label key={v || "__empty__"}
                      className="hover:bg-white/[0.05]"
                      style={{ display: "flex", alignItems: "center", gap: "7px", padding: "4px 6px", borderRadius: "5px", cursor: "pointer", fontSize: "12px", color: "var(--color-text-1)", fontFamily: "var(--font-mono)" }}>
                      <input type="checkbox" checked={checked}
                        onChange={() => onChange(checked ? multiValue.filter((x) => x !== v) : [...multiValue, v])} />
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</span>
                    </label>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
