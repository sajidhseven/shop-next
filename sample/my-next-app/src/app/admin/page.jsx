// file: src/app/admin/page.jsx

import prisma from "@/lib/db";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

// we replicate logic similar to getUserFromCookie()
// but inside a Server Component, so no "use client".
async function getSessionUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) return null;

  const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-this";

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // decoded: { userId, email, role, iat, exp }

    // fetch latest user from DB to be sure role is up to date
    const dbUser = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
      },
    });

    if (!dbUser) return null;

    return {
      id: dbUser.id,
      email: dbUser.email,
      role: dbUser.role,
      name:
        (dbUser.firstName || "") +
        (dbUser.lastName ? ` ${dbUser.lastName}` : ""),
    };
  } catch (err) {
    console.error("[/admin] invalid token:", err);
    return null;
  }
}

export default async function AdminPage() {
  const user = await getSessionUser();

  // 1. Not logged in at all? send to login
  if (!user) {
    redirect("/login");
  }

  // 2. Logged in but not ADMIN? show 403 message
  if (user.role !== "ADMIN") {
    return (
      <section
        style={{
          maxWidth: 800,
          margin: "40px auto",
          padding: "16px",
          border: "1px solid #eee",
          borderRadius: 12,
          background: "#fff5f5",
          boxShadow: "0 20px 40px rgba(0,0,0,0.03)",
        }}
      >
        <h2
          style={{
            marginTop: 0,
            marginBottom: 12,
            fontSize: 20,
            fontWeight: 600,
            color: "#c00",
          }}
        >
          Access Denied
        </h2>
        <p
          style={{
            color: "#444",
            fontSize: 15,
            lineHeight: 1.5,
            margin: 0,
          }}
        >
          You are logged in as <strong>{user.email}</strong>, but your role is{" "}
          <strong>{user.role}</strong>. Only ADMIN users can view the admin
          panel.
        </p>
      </section>
    );
  }

  // 3. user.role === "ADMIN", show dashboard
  // You can fetch whatever admin data you want here:
  const productCount = await prisma.product.count();
  const userCount = await prisma.user.count();
  const cartItemCount = await prisma.cartItem.count();

  return (
    <section
      style={{
        maxWidth: 1000,
        margin: "40px auto",
        padding: "16px",
        display: "grid",
        gap: 24,
      }}
    >
      <header>
        <h1
          style={{
            margin: 0,
            fontWeight: 600,
            fontSize: 24,
            lineHeight: 1.2,
          }}
        >
          Admin Dashboard
        </h1>
        <p
          style={{
            marginTop: 8,
            color: "#666",
            fontSize: 14,
            lineHeight: 1.4,
          }}
        >
          Welcome, {user.name || user.email}! You are logged in as{" "}
          <strong>{user.role}</strong>.
        </p>
      </header>

      {/* quick stats */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(min(220px,100%),1fr))",
          gap: 16,
        }}
      >
        <div
          style={{
            border: "1px solid #eee",
            borderRadius: 12,
            background: "#fff",
            padding: 16,
            boxShadow: "0 20px 40px rgba(0,0,0,0.03)",
          }}
        >
          <div
            style={{
              fontSize: 13,
              color: "#666",
              marginBottom: 4,
              lineHeight: 1.4,
            }}
          >
            Total Products
          </div>
          <div
            style={{
              fontSize: 24,
              fontWeight: 600,
              lineHeight: 1.2,
            }}
          >
            {productCount}
          </div>
        </div>

        <div
          style={{
            border: "1px solid #eee",
            borderRadius: 12,
            background: "#fff",
            padding: 16,
            boxShadow: "0 20px 40px rgba(0,0,0,0.03)",
          }}
        >
          <div
            style={{
              fontSize: 13,
              color: "#666",
              marginBottom: 4,
              lineHeight: 1.4,
            }}
          >
            Registered Users
          </div>
          <div
            style={{
              fontSize: 24,
              fontWeight: 600,
              lineHeight: 1.2,
            }}
          >
            {userCount}
          </div>
        </div>

        <div
          style={{
            border: "1px solid #eee",
            borderRadius: 12,
            background: "#fff",
            padding: 16,
            boxShadow: "0 20px 40px rgba(0,0,0,0.03)",
          }}
        >
          <div
            style={{
              fontSize: 13,
              color: "#666",
              marginBottom: 4,
              lineHeight: 1.4,
            }}
          >
            Cart Items in DB
          </div>
          <div
            style={{
              fontSize: 24,
              fontWeight: 600,
              lineHeight: 1.2,
            }}
          >
            {cartItemCount}
          </div>
        </div>
      </section>

      {/* placeholder for future admin features */}
      <section
        style={{
          border: "1px solid #eee",
          borderRadius: 12,
          background: "#fff",
          boxShadow: "0 20px 40px rgba(0,0,0,0.03)",
          padding: 16,
        }}
      >
        <h2
          style={{
            marginTop: 0,
            fontWeight: 600,
            fontSize: 18,
            lineHeight: 1.3,
          }}
        >
          Management
        </h2>
        <p
          style={{
            color: "#666",
            fontSize: 14,
            lineHeight: 1.5,
            marginBottom: 16,
          }}
        >
          This is where you’ll add product management (CRUD), view orders, etc.
        </p>

        <ul
          style={{
            fontSize: 14,
            color: "#333",
            lineHeight: 1.5,
            paddingLeft: 18,
            margin: 0,
          }}
        >
          <li>➕ Add new product</li>
          <li>✏️ Edit product price / image</li>
          <li>🗑️ Delete product</li>
          <li>👥 View all users / promote to admin</li>
        </ul>
      </section>
    </section>
  );
}
