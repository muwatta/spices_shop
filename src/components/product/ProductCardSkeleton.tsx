export default function ProductCardSkeleton() {
  return (
    <div
      className="card"
      style={{ padding: "1rem", animation: "pulse 1.5s infinite" }}
    >
      <div
        style={{
          aspectRatio: "4/3",
          background: "var(--clr-cream-dark)",
          borderRadius: "0.5rem",
        }}
      />
      <div
        style={{
          height: "1.2rem",
          background: "var(--clr-cream-dark)",
          marginTop: "0.75rem",
          width: "70%",
          borderRadius: "4px",
        }}
      />
      <div
        style={{
          height: "1rem",
          background: "var(--clr-cream-dark)",
          marginTop: "0.5rem",
          width: "90%",
          borderRadius: "4px",
        }}
      />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "1rem",
        }}
      >
        <div
          style={{
            width: "40%",
            height: "1.5rem",
            background: "var(--clr-cream-dark)",
            borderRadius: "4px",
          }}
        />
        <div
          style={{
            width: "30%",
            height: "2rem",
            background: "var(--clr-cream-dark)",
            borderRadius: "2rem",
          }}
        />
      </div>
    </div>
  );
}
