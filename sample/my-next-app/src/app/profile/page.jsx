"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();

  // responsive
  const [isMobile, setIsMobile] = useState(false);

  // auth + user info
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null); // { id, name, email }

  // logout button loading
  const [loggingOut, setLoggingOut] = useState(false);

  // watch mobile breakpoint, same pattern as login/signup
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(max-width: 768px)");
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  // fetch current user
  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        const res = await fetch("/api/auth/me", { method: "GET" });
        const data = await res.json();

        if (!ignore) {
          if (!data.user) {
            // not logged in -> go to login
            router.push("/login");
            return;
          }
          setUser(data.user); // {id,name,email}
          setLoading(false);
        }
      } catch (err) {
        if (!ignore) {
          // if it fails, assume not logged in
          router.push("/login");
        }
      }
    }

    load();
    return () => {
      ignore = true;
    };
  }, [router]);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      // after logout, go to home (or login)
      router.push("/login");
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  }

  if (loading) {
    return (
      <section
        style={{
          minHeight: "50vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
        }}
      >
        <p style={{ color: "#666" }}>Loading profile…</p>
      </section>
    );
  }

  return (
    <section
      style={{
        minHeight: "60vh",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        paddingTop: isMobile ? 24 : 80,
        paddingLeft: 16,
        paddingRight: 16,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          border: "1px solid #eee",
          borderRadius: 12,
          padding: 24,
          boxShadow: "0 20px 40px rgba(0,0,0,0.04)",
          background: "#fff",
          display: "grid",
          gap: 16,
        }}
      >
        <div style={{ textAlign: "center" }}>
          <h2
            style={{
              margin: 0,
              fontWeight: 600,
              fontSize: 20,
              lineHeight: 1.3,
            }}
          >
            Your Profile
          </h2>
          <p
            style={{
              marginTop: 6,
              marginBottom: 0,
              fontSize: 14,
              lineHeight: 1.4,
              color: "#666",
            }}
          >
            Signed in as {user.email}
          </p>
        </div>

        <div
          style={{
            border: "1px solid #eee",
            borderRadius: 10,
            padding: 16,
            background: "#fafafa",
            display: "grid",
            rowGap: 8,
            fontSize: 14,
            lineHeight: 1.4,
          }}
        >
          <div>
            <strong style={{ display: "block", fontSize: 13, color: "#555", textTransform: "uppercase", letterSpacing: "0.03em" }}>
              Name
            </strong>
            <span style={{ fontSize: 15 }}>{user.name}</span>
          </div>

          <div>
            <strong style={{ display: "block", fontSize: 13, color: "#555", textTransform: "uppercase", letterSpacing: "0.03em" }}>
              Email
            </strong>
            <span style={{ fontSize: 15 }}>{user.email}</span>
          </div>

          <div>
            <strong style={{ display: "block", fontSize: 13, color: "#555", textTransform: "uppercase", letterSpacing: "0.03em" }}>
              User ID
            </strong>
            <span style={{ fontSize: 12, color: "#888", wordBreak: "break-all" }}>
              {user.id}
            </span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          disabled={loggingOut}
          style={{
            width: "100%",
            padding: "12px 14px",
            borderRadius: 10,
            border: "1px solid #111",
            background: "#111",
            color: "#fff",
            fontSize: 15,
            fontWeight: 600,
            lineHeight: 1.2,
            cursor: loggingOut ? "default" : "pointer",
            opacity: loggingOut ? 0.8 : 1,
          }}
        >
          {loggingOut ? "Signing out…" : "Log out"}
        </button>

        <button
          onClick={() => router.push("/cart")}
          style={{
            width: "100%",
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid #ddd",
            background: "#fff",
            color: "#111",
            fontSize: 15,
            lineHeight: 1.2,
            cursor: "pointer",
          }}
        >
          View cart →
        </button>

        <button
          onClick={() => router.push("/products")}
          style={{
            width: "100%",
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid #ddd",
            background: "#fff",
            color: "#111",
            fontSize: 15,
            lineHeight: 1.2,
            cursor: "pointer",
          }}
        >
          Continue shopping →
        </button>
      </div>
    </section>
  );
}
