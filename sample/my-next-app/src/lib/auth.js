// /src/lib/auth.js
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-this";

// Create a signed JWT from a payload we control
export function signAuthToken(payload) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "7d",
  });
}

// Set auth_token cookie (httpOnly)
export async function setAuthCookie(token) {
  const cookieStore = await cookies();
  cookieStore.set({
    name: "auth_token",
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });
}

// Clear the auth cookie by setting it expired
export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.set({
    name: "auth_token",
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0, // expire immediately
  });
}

// Read + verify cookie, return decoded payload or null
export async function getUserFromCookie() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // decoded: { userId, email, role, iat, exp }
    return decoded;
  } catch (err) {
    console.error("[getUserFromCookie] invalid token:", err);
    return null;
  }
}

// existing exports...
export { getUserFromCookie as getCurrentUser };

