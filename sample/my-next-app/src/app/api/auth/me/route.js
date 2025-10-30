import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getUserFromCookie } from "@/lib/auth";

export async function GET() {
  try {
    const sessionData = await getUserFromCookie();
    console.log("[/api/auth/me] sessionData:", sessionData);

    if (
      !sessionData ||
      sessionData.userId === undefined ||
      sessionData.userId === null
    ) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    // Prisma expects Int for id
    let userIdForQuery = sessionData.userId;
    if (typeof userIdForQuery === "string") {
      const asNum = Number(userIdForQuery);
      if (!Number.isNaN(asNum)) {
        userIdForQuery = asNum;
      }
    }

    console.log(
      "[/api/auth/me] userIdForQuery:",
      userIdForQuery,
      "typeof:",
      typeof userIdForQuery
    );

    const dbUser = await prisma.user.findUnique({
      where: { id: userIdForQuery },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
      },
    });

    console.log("[/api/auth/me] dbUser:", dbUser);

    if (!dbUser) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const displayName =
      dbUser.firstName?.trim() ||
      dbUser.email?.split("@")[0] ||
      "User";

    const safeUser = {
      id: dbUser.id,
      email: dbUser.email,
      role: dbUser.role,
      displayName,
    };

    return NextResponse.json(
      { user: safeUser },
      { status: 200 }
    );
  } catch (err) {
    console.error("[/api/auth/me] ERROR:", err);
    return NextResponse.json(
      { error: "Server error", user: null },
      { status: 500 }
    );
  }
}
