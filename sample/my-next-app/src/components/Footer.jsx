export default function Footer() {
  return (
    <footer style={{ marginTop: 40, padding: "24px 0", borderTop: "1px solid #eee", color: "#666", textAlign: "center" }}>
      © {new Date().getFullYear()} MiniStore • Built with Next.js
    </footer>
  );
}
