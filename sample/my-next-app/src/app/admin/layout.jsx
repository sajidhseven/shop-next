import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export default async function AdminLayout({ children }) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "Admin") {
    redirect("/");
  }

  return (
    <section
      style={{
        display: "grid",
        gridTemplateColumns: "220px 1fr",
        minHeight: "100vh",
      }}
    >
      <aside
        style={{
          borderRight: "1px solid #eee",
          padding: "1rem",
          background: "#fafafa",
        }}
      >
        <h2
          style={{
            fontSize: "1rem",
            fontWeight: 600,
            marginBottom: "1rem",
          }}
        >
          Admin Panel
        </h2>

        <nav
          style={{
            display: "flex",
            flexDirection: "column",
            gap: ".5rem",
            fontSize: ".9rem",
          }}
        >
          <a href="/admin" style={{ color: "#111", textDecoration: "none" }}>
            Dashboard
          </a>
          <a
            href="/admin/products"
            style={{ color: "#111", textDecoration: "none" }}
          >
            Products
          </a>
          <a
            href="/admin/users"
            style={{ color: "#111", textDecoration: "none" }}
          >
            Users
          </a>
        </nav>
      </aside>

      <main style={{ padding: "2rem" }}>{children}</main>
    </section>
  );
}
