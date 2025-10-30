import prisma from "@/lib/db";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      price: true,
      description: false, // if you don't have description it's fine
      image: true,
      createdAt: true,
    },
  });

  return (
    <div>
      <div
        style={{
          marginBottom: "1rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2
          style={{
            fontSize: "1.1rem",
            fontWeight: 600,
            color: "#111",
          }}
        >
          Products
        </h2>

        <a
          href="/admin/products/new"
          style={{
            display: "inline-block",
            backgroundColor: "#111",
            color: "#fff",
            padding: ".5rem .75rem",
            fontSize: ".9rem",
            borderRadius: ".5rem",
            textDecoration: "none",
          }}
        >
          + Add Product
        </a>
      </div>

      <div
        style={{
          border: "1px solid #eee",
          borderRadius: "0.75rem",
          overflowX: "auto",
        }}
      >
        <table
          style={{
            width: "100%",
            fontSize: ".9rem",
            borderCollapse: "collapse",
          }}
        >
          <thead
            style={{
              background: "#fafafa",
              textAlign: "left",
              borderBottom: "1px solid #eee",
            }}
          >
            <tr>
              <th style={{ padding: ".75rem" }}>Name</th>
              <th style={{ padding: ".75rem" }}>Price</th>
              <th style={{ padding: ".75rem" }}>Image</th>
              <th style={{ padding: ".75rem" }}>Created</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr
                key={p.id}
                style={{
                  borderBottom: "1px solid #f2f2f2",
                }}
              >
                <td style={{ padding: ".75rem", fontWeight: 500 }}>
                  {p.name}
                </td>
                <td style={{ padding: ".75rem" }}>₹{p.price}</td>
                <td
                  style={{
                    padding: ".75rem",
                    maxWidth: "260px",
                    color: "#555",
                    wordBreak: "break-all",
                    fontSize: ".8rem",
                  }}
                >
                  {p.image}
                </td>
                <td
                  style={{
                    padding: ".75rem",
                    color: "#888",
                    whiteSpace: "nowrap",
                    fontSize: ".8rem",
                  }}
                >
                  {new Date(p.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}

            {products.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  style={{
                    padding: "2rem",
                    textAlign: "center",
                    color: "#666",
                    fontSize: ".9rem",
                  }}
                >
                  No products yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
