import ProductCard from "@/components/ProductCard";
import prisma from "@/lib/db";

// Server Component: /products
export default async function ProductsPage({ searchParams }) {
  // Next.js 16 dynamic route params are async-like,
  // so safely "await" it before using.
  const resolvedSearchParams = await searchParams;
  const q = resolvedSearchParams?.search || "";

  // Fetch products from DB on the server
  const all = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });

  // simple filter
  const term = q.toLowerCase();
  const filtered = term
    ? all.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.id.toLowerCase().includes(term)
      )
    : all;

  return (
    <section style={{ padding: 16, maxWidth: 1200, margin: "0 auto" }}>
      <h2 style={{ marginTop: 0, marginBottom: 16 }}>Products</h2>

      {q ? (
        <p
          style={{
            color: "#666",
            fontSize: 14,
            marginTop: 0,
            marginBottom: 16,
          }}
        >
          Showing results for <strong>{q}</strong>
        </p>
      ) : null}

      {filtered.length === 0 ? (
        <p style={{ color: "#666" }}>No results found.</p>
      ) : (
        <div
          style={{
            display: "grid",
            gap: 16,
            gridTemplateColumns:
              "repeat(auto-fit, minmax(min(240px,100%), 1fr))",
          }}
        >
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
