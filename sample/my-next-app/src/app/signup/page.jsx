"use client";

import { useEffect, useState } from "react";

export default function SignupPage() {
  const [isMobile, setIsMobile] = useState(false);

  // form fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName]   = useState("");
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");

  // ui state
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // responsive watcher
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(max-width: 768px)");
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          firstName,
          lastName,
        }),
      });

      if (res.ok) {
        // cookie is already set on backend
        window.location.href = "/products";
        return;
      } else {
        const data = await res.json().catch(() => ({}));
        setErrorMsg(data.error || "Signup failed.");
      }
    } catch (err) {
      setErrorMsg("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
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
        }}
      >
        <h2
          style={{
            textAlign: "center",
            marginTop: 0,
            marginBottom: 16,
            fontWeight: 600,
            fontSize: 20,
          }}
        >
          Create your account
        </h2>

        <form
          onSubmit={handleSubmit}
          style={{
            display: "grid",
            gap: 12,
          }}
        >
          {/* First name */}
          <div style={{ display: "grid", gap: 6 }}>
            <label
              style={{
                fontSize: 14,
                fontWeight: 500,
                color: "#333",
              }}
            >
              First name
            </label>
            <input
              placeholder="First name"
              type="text"
              name="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              style={{
                padding: "10px 12px",
                border: "1px solid #ddd",
                borderRadius: 8,
                fontSize: 14,
                outline: "none",
              }}
            />
          </div>

          {/* Last name */}
          <div style={{ display: "grid", gap: 6 }}>
            <label
              style={{
                fontSize: 14,
                fontWeight: 500,
                color: "#333",
              }}
            >
              Last name
            </label>
            <input
              placeholder="Last name"
              type="text"
              name="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              style={{
                padding: "10px 12px",
                border: "1px solid #ddd",
                borderRadius: 8,
                fontSize: 14,
                outline: "none",
              }}
            />
          </div>

          {/* Email */}
          <div style={{ display: "grid", gap: 6 }}>
            <label
              style={{
                fontSize: 14,
                fontWeight: 500,
                color: "#333",
              }}
            >
              Email
            </label>
            <input
              placeholder="Email"
              type="email"
              name="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                padding: "10px 12px",
                border: "1px solid #ddd",
                borderRadius: 8,
                fontSize: 14,
                outline: "none",
              }}
            />
          </div>

          {/* Password */}
          <div style={{ display: "grid", gap: 6 }}>
            <label
              style={{
                fontSize: 14,
                fontWeight: 500,
                color: "#333",
              }}
            >
              Password
            </label>
            <input
              placeholder="Password"
              type="password"
              name="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                padding: "10px 12px",
                border: "1px solid #ddd",
                borderRadius: 8,
                fontSize: 14,
                outline: "none",
              }}
            />
          </div>

          {errorMsg && (
            <div
              style={{
                fontSize: 14,
                color: "#c00",
                lineHeight: 1.4,
                background: "#fff5f5",
                border: "1px solid #ffcccc",
                borderRadius: 8,
                padding: "8px 10px",
              }}
            >
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 8,
              width: "100%",
              padding: "12px 14px",
              borderRadius: 10,
              border: "1px solid #111",
              background: loading ? "#555" : "#111",
              color: "#fff",
              fontSize: 15,
              fontWeight: 600,
              lineHeight: 1.2,
              cursor: loading ? "default" : "pointer",
              opacity: loading ? 0.8 : 1,
            }}
          >
            {loading ? "Creating..." : "Sign up"}
          </button>
        </form>

        <p
          style={{
            color: "#666",
            marginTop: 16,
            fontSize: 14,
            textAlign: "center",
            lineHeight: 1.4,
          }}
        >
          Already have an account?{" "}
          <a
            href="/login"
            style={{
              color: "#0a66c2",
              textDecoration: "none",
              fontWeight: 500,
            }}
          >
            Log in
          </a>
        </p>
      </div>
    </section>
  );
}
