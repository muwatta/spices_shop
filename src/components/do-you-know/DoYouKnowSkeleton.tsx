export default function DoYouKnowSkeleton() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: "1.5rem",
      }}
    >
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="card"
          style={{ padding: "1rem", animation: "pulse 1.5s infinite" }}
        >
          <div
            style={{
              height: "180px",
              background: "var(--clr-cream-dark)",
              borderRadius: "0.75rem",
            }}
          />
          <div
            style={{
              height: "1.5rem",
              background: "var(--clr-cream-dark)",
              marginTop: "0.75rem",
              width: "80%",
              borderRadius: "4px",
            }}
          />
          <div
            style={{
              height: "1rem",
              background: "var(--clr-cream-dark)",
              marginTop: "0.5rem",
              width: "100%",
              borderRadius: "4px",
            }}
          />
          <div
            style={{
              height: "1rem",
              background: "var(--clr-cream-dark)",
              marginTop: "0.25rem",
              width: "70%",
              borderRadius: "4px",
            }}
          />
        </div>
      ))}
    </div>
  );
}
