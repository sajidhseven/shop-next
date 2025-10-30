// /src/app/api/auth/logout/route.js
import { NextResponse } from "next/server";
import { clearAuthCookie } from "@/lib/auth";

export async function POST() {
  // nuke the cookie server-side
  await clearAuthCookie();

  // you can just return 200; Navbar will call /api/auth/me again and see null user
  return NextResponse.json(
    { message: "Logged out" },
    { status: 200 }
  );
}
