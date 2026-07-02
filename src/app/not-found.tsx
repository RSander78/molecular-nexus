export default function NotFound() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ textAlign: "center" }}>
        <h1 style={{ fontSize: "3rem", fontWeight: "bold", margin: "0 0 1rem" }}>404</h1>
        <p style={{ color: "#666" }}>Seite nicht gefunden</p>
        <a href="/dashboard" style={{ color: "#2563eb", marginTop: "1rem", display: "inline-block" }}>
          Zurück zum Dashboard
        </a>
      </div>
    </div>
  );
}
