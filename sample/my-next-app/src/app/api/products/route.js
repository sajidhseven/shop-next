import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("search")?.toLowerCase() || "";

  const all = await prisma.product.findMany({
    orderBy: { createdAt: "desc" }
  });

  const filtered = q
    ? all.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.id.toLowerCase().includes(q)
      )
    : all;

  return NextResponse.json(filtered, { status: 200 });
}
