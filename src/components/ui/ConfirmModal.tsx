"use client";

import { useEffect, useRef } from "react";

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "primary";
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) {
      confirmRef.current?.focus();
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onCancel]);

  if (!open) return null;

  const variantStyles: Record<string, { bg: string; hover: string; border: string }> = {
    danger: {
      bg: "var(--clr-chili)",
      hover: "#A0291A",
      border: "1px solid rgba(192,57,43,0.25)",
    },
    warning: {
      bg: "#D97706",
      hover: "#B45309",
      border: "1px solid rgba(217,119,6,0.25)",
    },
    primary: {
      bg: "var(--clr-terracotta-dark)",
      hover: "var(--clr-terracotta)",
      border: "1px solid rgba(180,90,60,0.25)",
    },
  };

  const v = variantStyles[variant] || variantStyles.danger;

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div
        ref={dialogRef}
        className="modal-content"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        aria-describedby="confirm-modal-message"
        onClick={(e) => e.stopPropagation()}
        style={{ padding: "1.5rem", maxWidth: 420 }}
      >
        <h2
          id="confirm-modal-title"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "1.15rem",
            marginBottom: "0.75rem",
            color: "var(--clr-bark)",
          }}
        >
          {title}
        </h2>
        <p
          id="confirm-modal-message"
          style={{
            fontSize: "0.9rem",
            color: "var(--clr-muted)",
            lineHeight: 1.6,
            margin: 0,
            marginBottom: "1.5rem",
          }}
        >
          {message}
        </p>
        <div className="confirm-modal-actions">
          <button
            onClick={onCancel}
            className="btn btn-outline btn-sm"
            style={{ minWidth: 80 }}
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            onClick={onConfirm}
            className="btn btn-sm"
            style={{
              background: v.bg,
              color: "#fff",
              border: v.border,
              minWidth: 80,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = v.hover)}
            onMouseLeave={(e) => (e.currentTarget.style.background = v.bg)}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
