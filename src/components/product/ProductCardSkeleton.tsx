export default function ProductCardSkeleton() {
  return (
    <div className="product-card" style={{ animation: "pulse 1.5s infinite" }}>
      <div
        style={{
          aspectRatio: "1/1",
          background: "var(--clr-cream-dark)",
        }}
      />
      <div style={{ padding: "0.875rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <div
          style={{
            height: "1rem",
            background: "var(--clr-cream-dark)",
            width: "75%",
            borderRadius: "4px",
          }}
        />
        <div
          style={{
            height: "0.8rem",
            background: "var(--clr-cream-dark)",
            width: "50%",
            borderRadius: "4px",
            marginTop: "0.25rem",
          }}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "0.75rem",
            paddingTop: "0.625rem",
            borderTop: "1px solid var(--clr-cream-dark)",
          }}
        >
          <div
            style={{
              width: "35%",
              height: "1.1rem",
              background: "var(--clr-cream-dark)",
              borderRadius: "4px",
            }}
          />
          <div
            style={{
              width: "28%",
              height: "2rem",
              background: "var(--clr-cream-dark)",
              borderRadius: "var(--radius-full)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
