import prisma from "@/lib/db";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { signAuthToken, setAuthCookie } from "@/lib/auth";

export async function POST(req) {
  try {
    const body = await req.json();
    const { email, password, firstName, lastName } = body || {};

    console.log("[/api/auth/signup] body:", {
      email,
      hasPassword: !!password,
      firstName,
      lastName,
    });

    // require email + password ONLY
    if (!email || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    // hash plaintext password
    const hashed = await bcrypt.hash(password, 10);

    // build data for prisma.user.create() based on YOUR schema
    const createData = {
      email,
      password: hashed,        // <-- your DB column is literally `password`
      role: "CUSTOMER",
      // firstName / lastName appear to be optional in your client
      ...(firstName
        ? { firstName: firstName.trim() }
        : {}),
      ...(lastName
        ? { lastName: lastName.trim() }
        : {}),
    };

    console.log("[/api/auth/signup] createData:", createData);

    const createdUser = await prisma.user.create({
      data: createData,
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
      },
    });

    console.log("[/api/auth/signup] createdUser:", createdUser);

    // sign JWT
    const tokenPayload = {
      userId: createdUser.id,
      email: createdUser.email,
      role: createdUser.role,
    };

    const token = signAuthToken(tokenPayload);
    console.log("[/api/auth/signup] tokenPayload:", tokenPayload);

    // set cookie so user is logged in after signup
    await setAuthCookie(token);

    const displayName =
      createdUser.firstName?.trim() ||
      createdUser.email?.split("@")[0] ||
      "User";

    const safeUser = {
      id: createdUser.id,
      email: createdUser.email,
      role: createdUser.role,
      displayName,
    };

    return NextResponse.json(
      {
        user: safeUser,
        message: "Signup successful",
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[/api/auth/signup] ERROR:", err);
    return NextResponse.json(
      { error: "Signup failed" },
      { status: 500 }
    );
  }
}
