"use client";

import { useEffect, useState, useCallback } from "react";

export interface Toast {
  id: string;
  message: string;
  action?: { label: string; onClick: () => void };
  duration?: number;
}

let toastListeners: ((toast: Toast) => void)[] = [];

export function showToast(toast: Omit<Toast, "id">) {
  const id = Math.random().toString(36).slice(2);
  toastListeners.forEach((l) => l({ ...toast, id }));
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Toast) => {
    setToasts((prev) => [...prev, toast]);
  }, []);

  useEffect(() => {
    toastListeners.push(addToast);
    return () => {
      toastListeners = toastListeners.filter((l) => l !== addToast);
    };
  }, [addToast]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container" role="status" aria-live="polite" aria-atomic="true">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={dismiss} />
      ))}

      <style>{`
        .toast-container {
          position: fixed;
          bottom: calc(var(--nav-height, 64px) + 1rem);
          left: 50%;
          transform: translateX(-50%);
          z-index: 10000;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          align-items: center;
          pointer-events: none;
          width: max-content;
          max-width: calc(100vw - 2rem);
        }
        @media (min-width: 900px) {
          .toast-container {
            bottom: 1.5rem;
            right: 1.5rem;
            left: auto;
            transform: none;
            align-items: flex-end;
          }
        }
        .toast {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          background: var(--clr-bark);
          color: var(--clr-cream);
          border-radius: var(--radius-md);
          font-size: var(--text-sm);
          font-weight: 500;
          box-shadow: var(--shadow-lg);
          pointer-events: auto;
          animation: toastIn 0.25s ease;
          max-width: 100%;
        }
        .toast--exiting {
          animation: toastOut 0.2s ease forwards;
        }
        .toast__message {
          flex: 1;
          min-width: 0;
        }
        .toast__action {
          background: none;
          border: none;
          color: var(--clr-turmeric);
          font-weight: 700;
          font-size: var(--text-sm);
          cursor: pointer;
          white-space: nowrap;
          padding: 0;
          font-family: var(--font-body);
          transition: opacity var(--transition-fast);
        }
        .toast__action:hover {
          opacity: 0.8;
        }
        .toast__dismiss {
          background: none;
          border: none;
          color: rgba(250,247,242,0.5);
          cursor: pointer;
          padding: 0.15rem;
          display: flex;
          align-items: center;
          flex-shrink: 0;
          transition: color var(--transition-fast);
        }
        .toast__dismiss:hover {
          color: var(--clr-cream);
        }
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(8px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes toastOut {
          from { opacity: 1; transform: translateY(0) scale(1); }
          to { opacity: 0; transform: translateY(8px) scale(0.96); }
        }
      `}</style>
    </div>
  );
}

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: (id: string) => void;
}) {
  const [exiting, setExiting] = useState(false);
  const duration = toast.duration ?? 6000;

  useEffect(() => {
    if (duration <= 0) return;
    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(() => onDismiss(toast.id), 200);
    }, duration);
    return () => clearTimeout(timer);
  }, [toast.id, duration, onDismiss]);

  const handleDismiss = () => {
    setExiting(true);
    setTimeout(() => onDismiss(toast.id), 200);
  };

  return (
    <div className={`toast ${exiting ? "toast--exiting" : ""}`}>
      <span className="toast__message">{toast.message}</span>
      {toast.action && (
        <button
          className="toast__action"
          onClick={() => {
            toast.action!.onClick();
            handleDismiss();
          }}
        >
          {toast.action.label}
        </button>
      )}
      <button className="toast__dismiss" onClick={handleDismiss} aria-label="Dismiss">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
