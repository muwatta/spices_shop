"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import { ProductCategory } from "@/types";
import { X, ZoomIn } from "lucide-react";

const CATEGORY_STYLES: Record<string, { bg: string; fg: string }> = {
  spices:     { bg: "#FDF2E4", fg: "#B45A3C" },
  herbs:      { bg: "#E8F5E9", fg: "#2E7D32" },
  seasonings: { bg: "#FFF3E0", fg: "#E65100" },
  blends:     { bg: "#FFF8E1", fg: "#F57F17" },
  peppers:    { bg: "#FFEBEE", fg: "#C62828" },
  oils:       { bg: "#F1F8E9", fg: "#558B2F" },
  flours:     { bg: "#FFFDE7", fg: "#F9A825" },
  other:      { bg: "#F5F0EB", fg: "#8B7355" },
};
const FALLBACK = { bg: "#F5F0EB", fg: "#8B7355" };

interface ProductGalleryProps {
  imageUrl: string | null;
  productName: string;
  category?: ProductCategory | null;
}

export default function ProductGallery({
  imageUrl,
  productName,
  category,
}: ProductGalleryProps) {
  const [zoomOpen, setZoomOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchDelta, setTouchDelta] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const colors = category ? CATEGORY_STYLES[category] ?? FALLBACK : FALLBACK;
  const showImage = imageUrl && !imgError;

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (touchStart === null) return;
    setTouchDelta(e.touches[0].clientX - touchStart);
  }, [touchStart]);

  const handleTouchEnd = useCallback(() => {
    setTouchStart(null);
    setTouchDelta(0);
  }, []);

  // Close zoom on ESC
  useEffect(() => {
    if (!zoomOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setZoomOpen(false);
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [zoomOpen]);

  return (
    <>
      {/* Main gallery container */}
      <div className="pd-gallery" ref={containerRef}>
        {/* Main image */}
        <div
          className="pd-gallery__main"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onClick={() => showImage && setZoomOpen(true)}
          role={showImage ? "button" : undefined}
          aria-label={showImage ? `Zoom ${productName}` : undefined}
          tabIndex={showImage ? 0 : undefined}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setZoomOpen(true);
            }
          }}
          style={{
            transform: touchStart !== null ? `translateX(${touchDelta * 0.3}px)` : undefined,
            transition: touchStart !== null ? "none" : undefined,
          }}
        >
          {showImage ? (
            <>
              {!loaded && <div className="pd-gallery__skeleton" />}
              <Image
                src={imageUrl!}
                alt={productName}
                fill
                sizes="(max-width: 768px) 100vw, 55vw"
                priority
                className="pd-gallery__img"
                style={{ objectFit: "cover", opacity: loaded ? 1 : 0, transition: "opacity 0.3s ease" }}
                onError={() => setImgError(true)}
                onLoad={() => setLoaded(true)}
                quality={85}
              />
              <span className="pd-gallery__zoom-hint" aria-hidden="true">
                <ZoomIn size={18} />
              </span>
            </>
          ) : (
            <div
              className="pd-gallery__placeholder"
              style={{ background: colors.bg }}
              role="img"
              aria-label={productName}
            >
              <span style={{ color: colors.fg, fontWeight: 700, fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.08em", textAlign: "center", maxWidth: "80%", lineHeight: 1.3 }}>
                {productName}
              </span>
            </div>
          )}
        </div>

        {/* Thumbnail strip (desktop) */}
        <div className="pd-gallery__thumbs">
          <button
            className="pd-gallery__thumb pd-gallery__thumb--active"
            aria-label={`View ${productName}`}
          >
            {showImage ? (
              <Image
                src={imageUrl!}
                alt=""
                fill
                sizes="64px"
                style={{ objectFit: "cover" }}
              />
            ) : (
              <div style={{ width: "100%", height: "100%", background: colors.bg }} />
            )}
          </button>
        </div>

        {/* Dot indicator (mobile) */}
        <div className="pd-gallery__dots" aria-hidden="true">
          <span className="pd-gallery__dot pd-gallery__dot--active" />
        </div>
      </div>

      {/* Zoom modal */}
      {zoomOpen && showImage && (
        <div
          className="pd-zoom-overlay"
          onClick={() => setZoomOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label={`Zoomed view of ${productName}`}
        >
          <button
            className="pd-zoom-close"
            onClick={() => setZoomOpen(false)}
            aria-label="Close zoom"
          >
            <X size={24} />
          </button>
          <div className="pd-zoom-content" onClick={(e) => e.stopPropagation()}>
            <Image
              src={imageUrl!}
              alt={productName}
              fill
              sizes="100vw"
              style={{ objectFit: "contain" }}
              quality={90}
            />
          </div>
        </div>
      )}

      <style>{`
        .pd-gallery {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .pd-gallery__main {
          position: relative;
          aspect-ratio: 1 / 1;
          border-radius: var(--radius-lg);
          overflow: hidden;
          background: var(--clr-cream-dark);
          cursor: zoom-in;
          touch-action: pan-y;
          will-change: transform;
        }
        .pd-gallery__img {
          object-fit: cover;
        }
        .pd-gallery__skeleton {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, var(--clr-cream), var(--clr-cream-dark));
          animation: skeleton-shimmer 1.4s ease-in-out infinite;
        }
        .pd-gallery__placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .pd-gallery__zoom-hint {
          position: absolute;
          bottom: 0.75rem;
          right: 0.75rem;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255,255,255,0.85);
          backdrop-filter: blur(8px);
          border-radius: 50%;
          color: var(--clr-bark);
          opacity: 0;
          transition: opacity var(--transition-fast);
          pointer-events: none;
        }
        .pd-gallery__main:hover .pd-gallery__zoom-hint {
          opacity: 1;
        }

        /* Thumbnails — desktop only */
        .pd-gallery__thumbs {
          display: none;
          gap: 0.5rem;
        }
        .pd-gallery__thumb {
          position: relative;
          width: 64px;
          height: 64px;
          border-radius: var(--radius-md);
          overflow: hidden;
          border: 2px solid transparent;
          cursor: pointer;
          background: var(--clr-cream-dark);
          flex-shrink: 0;
          transition: border-color var(--transition-fast);
        }
        .pd-gallery__thumb--active {
          border-color: var(--clr-terracotta);
        }
        .pd-gallery__thumb:hover {
          border-color: var(--clr-terracotta-light);
        }

        /* Dots — mobile only */
        .pd-gallery__dots {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.35rem;
        }
        .pd-gallery__dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--clr-cream-dark);
          transition: background var(--transition-fast);
        }
        .pd-gallery__dot--active {
          background: var(--clr-terracotta);
        }

        /* Zoom overlay */
        .pd-zoom-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: rgba(30, 23, 16, 0.92);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          animation: fadeIn 0.2s ease;
        }
        .pd-zoom-close {
          position: absolute;
          top: 1rem;
          right: 1rem;
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255,255,255,0.15);
          border: none;
          border-radius: 50%;
          color: white;
          cursor: pointer;
          z-index: 10;
          transition: background var(--transition-fast);
        }
        .pd-zoom-close:hover {
          background: rgba(255,255,255,0.25);
        }
        .pd-zoom-content {
          position: relative;
          width: 90vw;
          height: 90vh;
          max-width: 1200px;
          max-height: 1200px;
        }

        @media (min-width: 768px) {
          .pd-gallery__thumbs {
            display: flex;
          }
          .pd-gallery__dots {
            display: none;
          }
        }
      `}</style>
    </>
  );
}
