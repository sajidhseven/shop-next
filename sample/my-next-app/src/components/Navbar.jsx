"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect, useCallback } from "react";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  // responsive
  const [isMobile, setIsMobile] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // search box
  const [q, setQ] = useState("");

  // auth state
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // cart state
  const [cartCount, setCartCount] = useState(0);
  const [cartLoading, setCartLoading] = useState(true);

  // responsive breakpoint
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(max-width: 768px)");
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  // sync search input to ?search=
  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    const s = url.searchParams.get("search") || "";
    setQ(s);
  }, [pathname]);

  // -------- AUTH FETCH --------
  const loadUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", {
        method: "GET",
        cache: "no-store",
      });
      const data = await res.json();
      setUser(data.user || null);
    } catch (err) {
      console.error("Navbar loadUser error:", err);
      setUser(null);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  // -------- CART FETCH (COUNT ONLY) --------
  const loadCartCount = useCallback(async () => {
    try {
      const res = await fetch("/api/cart", {
        method: "GET",
        cache: "no-store",
      });

      if (!res.ok) {
        // likely 401 if logged out
        setCartCount(0);
        setCartLoading(false);
        return;
      }

      const data = await res.json();
      const items = Array.isArray(data.items) ? data.items : [];
      const totalQty = items.reduce((sum, it) => sum + (it.qty || 0), 0);
      setCartCount(totalQty);
      setCartLoading(false);
    } catch (err) {
      console.error("Navbar loadCartCount error:", err);
      setCartCount(0);
      setCartLoading(false);
    }
  }, []);

  // run both whenever route changes (covers login/logout/nav)
  useEffect(() => {
    loadUser();
    loadCartCount();
    setMenuOpen(false);
    setUserMenuOpen(false);
  }, [pathname, loadUser, loadCartCount]);

  // LISTEN for "cart-updated" events fired anywhere in the app
  useEffect(() => {
    function handleCartUpdated() {
      loadCartCount();
    }
    window.addEventListener("cart-updated", handleCartUpdated);
    return () => {
      window.removeEventListener("cart-updated", handleCartUpdated);
    };
  }, [loadCartCount]);

  // logout
  const handleLogout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("Navbar logout error:", err);
    }

    setUser(null);
    setUserMenuOpen(false);
    setMenuOpen(false);

    // clear cart badge immediately
    setCartCount(0);

    router.refresh();
    router.push("/");
  }, [router]);

  const isActiveStyle = (p) =>
    pathname === p
      ? { background: "#f2f2f2", borderRadius: 8 }
      : {};

  const onSearch = (e) => {
    e.preventDefault();
    const term = q.trim();
    router.push(
      term
        ? `/products?search=${encodeURIComponent(term)}`
        : "/products"
    );
    setMenuOpen(false);
  };

  const SearchBar = (
    <form
      onSubmit={onSearch}
      style={{ flex: 1, maxWidth: isMobile ? "100%" : 520 }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          border: "1px solid #ddd",
          borderRadius: 999,
          padding: "6px 10px",
        }}
      >
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search products…"
          aria-label="Search"
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            fontSize: 14,
            background: "transparent",
          }}
        />
        <button
          type="submit"
          style={{
            border: "1px solid #111",
            background: "#111",
            color: "#fff",
            borderRadius: 999,
            padding: "6px 12px",
            cursor: "pointer",
            fontSize: 14,
            lineHeight: 1.2,
          }}
        >
          Search
        </button>
      </div>
    </form>
  );

  // DESKTOP VIEW
  if (!isMobile) {
    return (
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          gap: 20,
          padding: 12,
          borderBottom: "1px solid #eee",
          background: "#fff",
        }}
      >
        {/* Brand */}
        <Link
          href="/"
          style={{
            fontWeight: 800,
            textDecoration: "none",
            color: "inherit",
            fontSize: 18,
            whiteSpace: "nowrap",
          }}
        >
          MiniStore
        </Link>

        {/* Search */}
        {SearchBar}

        {/* Right side */}
        <nav
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginLeft: "auto",
            position: "relative",
          }}
        >
          <Link
            href="/products"
            style={{
              ...isActiveStyle("/products"),
              textDecoration: "none",
              padding: "6px 10px",
              borderRadius: 8,
            }}
          >
            Products
          </Link>

          <Link
            href="/cart"
            style={{
              ...isActiveStyle("/cart"),
              textDecoration: "none",
              padding: "6px 10px",
              borderRadius: 8,
            }}
          >
            Cart ({cartLoading ? "…" : cartCount})
          </Link>

          {/* logged in */}
          {!authLoading && user && (
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setUserMenuOpen((prev) => !prev)}
                style={{
                  background: "none",
                  border: "1px solid #ddd",
                  borderRadius: 8,
                  cursor: "pointer",
                  padding: "6px 10px",
                  lineHeight: 1.2,
                  fontSize: 14,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <span>Hi, {user.displayName || "User"}</span>
                <span
                  style={{
                    fontSize: 11,
                    color: "#666",
                    border: "1px solid #eee",
                    borderRadius: 4,
                    padding: "0px 4px",
                    lineHeight: 1.2,
                  }}
                >
                  {user.role || "USER"}
                </span>
                <span style={{ fontSize: 12 }}>▼</span>
              </button>

              {userMenuOpen && (
                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    top: "calc(100% + 6px)",
                    minWidth: 180,
                    background: "#fff",
                    border: "1px solid #eee",
                    borderRadius: 10,
                    boxShadow: "0 16px 32px rgba(0,0,0,0.08)",
                    padding: 8,
                    display: "grid",
                    gap: 4,
                    zIndex: 100,
                  }}
                >
                  <Link
                    href="/profile"
                    style={{
                      textDecoration: "none",
                      color: "#111",
                      fontSize: 14,
                      padding: "8px 10px",
                      borderRadius: 8,
                      lineHeight: 1.2,
                      display: "block",
                    }}
                    onClick={() => {
                      setUserMenuOpen(false);
                    }}
                  >
                    Profile
                  </Link>

                  {user.role === "ADMIN" && (
                    <Link
                      href="/admin"
                      style={{
                        textDecoration: "none",
                        color: "#111",
                        fontSize: 14,
                        padding: "8px 10px",
                        borderRadius: 8,
                        lineHeight: 1.2,
                        display: "block",
                      }}
                      onClick={() => {
                        setUserMenuOpen(false);
                      }}
                    >
                      Admin Panel
                    </Link>
                  )}

                  <button
                    onClick={handleLogout}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      background: "none",
                      border: "none",
                      fontSize: 14,
                      padding: "8px 10px",
                      borderRadius: 8,
                      lineHeight: 1.2,
                      cursor: "pointer",
                      color: "#c00",
                    }}
                  >
                    Log out
                  </button>
                </div>
              )}
            </div>
          )}

          {/* logged out */}
          {!authLoading && !user && (
            <>
              <Link
                href="/login"
                style={{
                  textDecoration: "none",
                  padding: "6px 10px",
                  borderRadius: 8,
                }}
              >
                Log in
              </Link>
              <Link
                href="/signup"
                style={{
                  textDecoration: "none",
                  padding: "6px 12px",
                  borderRadius: 10,
                  border: "1px solid #111",
                  background: "#111",
                  color: "#fff",
                  lineHeight: 1.2,
                  fontSize: 14,
                }}
              >
                Sign up
              </Link>
            </>
          )}

          {authLoading && (
            <span
              style={{
                fontSize: 14,
                color: "#999",
                padding: "6px 10px",
              }}
            >
              …
            </span>
          )}
        </nav>
      </header>
    );
  }

  // MOBILE VIEW
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 10,
        background: "#fff",
        borderBottom: "1px solid #eee",
        padding: 12,
        display: "grid",
        rowGap: 12,
      }}
    >
      {/* Row 1 */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <button
          onClick={() => setMenuOpen((m) => !m)}
          aria-label="Menu"
          style={{
            appearance: "none",
            background: "none",
            border: "1px solid #ddd",
            borderRadius: 8,
            width: 36,
            height: 32,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            gap: 4,
            cursor: "pointer",
          }}
        >
          <span style={{ width: 18, height: 2, background: "#111", borderRadius: 1 }} />
          <span style={{ width: 18, height: 2, background: "#111", borderRadius: 1 }} />
          <span style={{ width: 18, height: 2, background: "#111", borderRadius: 1 }} />
        </button>

        <Link
          href="/"
          style={{
            fontWeight: 800,
            textDecoration: "none",
            color: "inherit",
            fontSize: 18,
            flex: 1,
            textAlign: "center",
          }}
          onClick={() => setMenuOpen(false)}
        >
          MiniStore
        </Link>

        <Link
          href="/cart"
          style={{
            textDecoration: "none",
            color: "inherit",
            fontSize: 14,
            fontWeight: 500,
            border: "1px solid #111",
            borderRadius: 8,
            padding: "6px 10px",
            lineHeight: 1.2,
            whiteSpace: "nowrap",
          }}
          onClick={() => setMenuOpen(false)}
        >
          Cart ({cartLoading ? "…" : cartCount})
        </Link>
      </div>

      {/* Row 2: search */}
      <div>{SearchBar}</div>

      {/* Row 3: dropdown menu */}
      {menuOpen && (
        <nav
          style={{
            display: "grid",
            gap: 8,
            background: "#fff",
            border: "1px solid #eee",
            borderRadius: 12,
            padding: 12,
            boxShadow: "0 16px 32px rgba(0,0,0,0.08)",
          }}
        >
          <Link
            href="/products"
            style={{
              ...isActiveStyle("/products"),
              textDecoration: "none",
              padding: "10px 12px",
              borderRadius: 8,
              fontSize: 15,
              fontWeight: 500,
            }}
            onClick={() => setMenuOpen(false)}
          >
            Products
          </Link>

          {/* Logged in */}
          {!authLoading && user && (
            <>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 500,
                  padding: "0 12px",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  flexWrap: "wrap",
                }}
              >
                <span>Hi, {user.displayName || "User"} 👋</span>
                <span
                  style={{
                    fontSize: 11,
                    color: "#666",
                    border: "1px solid #eee",
                    borderRadius: 4,
                    padding: "0px 4px",
                    lineHeight: 1.2,
                  }}
                >
                  {user.role || "USER"}
                </span>
              </div>

              <Link
                href="/profile"
                style={{
                  ...isActiveStyle("/profile"),
                  textDecoration: "none",
                  padding: "10px 12px",
                  borderRadius: 8,
                  fontSize: 15,
                  fontWeight: 500,
                }}
                onClick={() => setMenuOpen(false)}
              >
                Profile
              </Link>

              {user.role === "ADMIN" && (
                <Link
                  href="/admin"
                  style={{
                    ...isActiveStyle("/admin"),
                    textDecoration: "none",
                    padding: "10px 12px",
                    borderRadius: 8,
                    fontSize: 15,
                    fontWeight: 500,
                  }}
                  onClick={() => setMenuOpen(false)}
                >
                  Admin Panel
                </Link>
              )}

              <button
                onClick={async () => {
                  await handleLogout();
                  // menu closes in handleLogout anyway
                }}
                style={{
                  width: "100%",
                  textAlign: "left",
                  background: "none",
                  border: "1px solid #c00",
                  color: "#c00",
                  borderRadius: 8,
                  padding: "10px 12px",
                  fontSize: 15,
                  fontWeight: 500,
                  lineHeight: 1.2,
                  cursor: "pointer",
                }}
              >
                Log out
              </button>
            </>
          )}

          {/* Logged out */}
          {!authLoading && !user && (
            <>
              <Link
                href="/login"
                style={{
                  textDecoration: "none",
                  padding: "10px 12px",
                  borderRadius: 8,
                  fontSize: 15,
                  fontWeight: 500,
                }}
                onClick={() => setMenuOpen(false)}
              >
                Log in
              </Link>
              <Link
                href="/signup"
                style={{
                  textDecoration: "none",
                  padding: "10px 12px",
                  borderRadius: 8,
                  fontSize: 15,
                  fontWeight: 500,
                  border: "1px solid #111",
                  background: "#111",
                  color: "#fff",
                  lineHeight: 1.2,
                  textAlign: "center",
                }}
                onClick={() => setMenuOpen(false)}
              >
                Sign up
              </Link>
            </>
          )}

          {/* Loading */}
          {authLoading && (
            <div
              style={{
                fontSize: 14,
                color: "#999",
                padding: "8px 10px",
              }}
            >
              …
            </div>
          )}
        </nav>
      )}
    </header>
  );
}
