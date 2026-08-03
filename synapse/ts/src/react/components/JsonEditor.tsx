"use client";
import { GlassPanel } from "./GlassPanel";

import { Textarea } from "./Textarea";
import { cn } from "../../lib/cn";

interface JsonEditorProps {
  value: string;
  onChange: (v: string) => void;
  error?: string;
  placeholder?: string;
  rows?: number;
}

export function JsonEditor({
  value,
  onChange,
  error,
  placeholder = "{}",
  rows = 4,
}: JsonEditorProps) {
  return (
    <GlassPanel soft className="p-2 space-y-1">
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className={cn(
          "font-mono text-sm resize-y bg-transparent border-0 shadow-none focus-visible:ring-0",
          error && "border-destructive focus-visible:ring-destructive"
        )}
      />
      {error && (
        <p className="text-xs" style={{ color: "#ef4444" }}>{error}</p>
      )}
    </GlassPanel>
  );
}

export function validateJson(value: string): string | undefined {
  if (!value.trim() || value.trim() === "{}") return undefined;
  try {
    JSON.parse(value);
    return undefined;
  } catch (e) {
    return e instanceof Error ? e.message : "Invalid JSON";
  }
}
