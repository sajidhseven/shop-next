import prisma from "@/lib/db";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { signAuthToken, setAuthCookie } from "@/lib/auth";

export async function POST(req) {
  try {
    const { email, password } = await req.json();
    console.log("[/api/auth/login] body:", { email });

    if (!email || !password) {
      return NextResponse.json(
        { error: "Missing email or password" },
        { status: 400 }
      );
    }

    // IMPORTANT:
    // Your actual Prisma client has fields:
    // id, email, password, role, firstName?, lastName?, createdAt, cartItems
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        role: true,
        password: true,     // <-- this is the hashed password column in *your* db
        firstName: true,
        lastName: true,
      },
    });

    console.log("[/api/auth/login] fetched user:", {
      id: user?.id,
      email: user?.email,
      role: user?.role,
      hasPassword: !!user?.password,
    });

    if (!user || !user.password) {
      // user doesn't exist OR row is malformed
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Compare plaintext password from form to hashed password field in DB
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Build JWT payload using your real columns
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const token = signAuthToken(tokenPayload);
    console.log("[/api/auth/login] tokenPayload:", tokenPayload);

    // Set cookie
    await setAuthCookie(token);

    // Build safe user for client
    const displayName =
      user.firstName?.trim() ||
      user.email?.split("@")[0] ||
      "User";

    const safeUser = {
      id: user.id,
      email: user.email,
      role: user.role,
      displayName,
    };

    return NextResponse.json(
      {
        user: safeUser,
        message: "Login success",
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("[/api/auth/login] ERROR:", err);
    return NextResponse.json(
      { error: "Login failed" },
      { status: 500 }
    );
  }
}
