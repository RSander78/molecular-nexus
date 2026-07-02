function Error({ statusCode }: { statusCode?: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ textAlign: "center" }}>
        <h1 style={{ fontSize: "3rem", fontWeight: "bold", margin: "0 0 1rem" }}>
          {statusCode || "Fehler"}
        </h1>
        <p style={{ color: "#666" }}>
          {statusCode === 404 ? "Seite nicht gefunden" : "Ein Fehler ist aufgetreten"}
        </p>
        <a href="/dashboard" style={{ color: "#2563eb", marginTop: "1rem", display: "inline-block" }}>
          Zurück zum Dashboard
        </a>
      </div>
    </div>
  );
}

Error.getInitialProps = ({ res, err }: any) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;
