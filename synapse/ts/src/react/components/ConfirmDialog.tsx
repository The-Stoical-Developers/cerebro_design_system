"use client";
import { Button } from "./Button";
import { GlassPanel } from "./GlassPanel";

import { useEffect, useRef } from "react";

interface ConfirmDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  loading?: boolean;
}

export function ConfirmDialog({
  open,
  onConfirm,
  onCancel,
  title,
  description,
  confirmLabel = "Delete",
  loading = false,
}: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    cancelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onCancel(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Backdrop */}
      <div
        data-testid="confirm-dialog-backdrop"
        onClick={onCancel}
        style={{
          position: "fixed",
          inset: 0,
          background: "oklch(0 0 0 / 0.45)",
          backdropFilter: "blur(2px)",
        }}
      />

      {/* Dialog */}
      <GlassPanel
        soft
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        style={{
          position: "relative",
          zIndex: 101,
          width: "100%",
          maxWidth: "400px",
          margin: "0 16px",
          padding: "24px",
        }}
      >
        {/* Icon */}
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "8px",
            background: "oklch(0.72 0.17 25 / 0.12)",
            border: "1px solid oklch(0.72 0.17 25 / 0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "14px",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="oklch(0.72 0.17 25)" strokeWidth="1.5">
            <path d="M8 4h4M6 6h8l-1 10H7L6 6zM4 6h12"/>
            <path d="M9 9v5M11 9v5"/>
          </svg>
        </div>

        <h3
          id="confirm-title"
          style={{
            margin: "0 0 6px",
            fontSize: "15px",
            fontWeight: 600,
            color: "#111827",
            letterSpacing: "-0.01em",
          }}
        >
          {title}
        </h3>
        <p
          style={{
            margin: "0 0 22px",
            fontSize: "13px",
            color: "#6b7280",
            lineHeight: 1.5,
          }}
        >
          {description}
        </p>

        <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
          <Button
            ref={cancelRef}
            variant="ghost"
            size="sm"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading && (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: "spin 0.8s linear infinite" }}>
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
              </svg>
            )}
            {confirmLabel}
          </Button>
        </div>
      </GlassPanel>
    </div>
  );
}
