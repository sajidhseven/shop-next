// /src/app/api/cart/route.js
import prisma from "@/lib/db";
import { NextResponse } from "next/server";
import { getUserFromCookie } from "@/lib/auth";

// Helper: ensure we have a valid logged-in userId (Int for Prisma.user.id)
async function requireUserId() {
  const session = await getUserFromCookie();
  console.log("[/api/cart] session:", session);

  if (!session || session.userId === undefined || session.userId === null) {
    return { error: "Not authenticated", userId: null };
  }

  let userId = session.userId;
  // Coerce string -> number just in case
  if (typeof userId === "string") {
    const asNum = Number(userId);
    if (!Number.isNaN(asNum)) {
      userId = asNum;
    }
  }

  return { error: null, userId };
}

// ================= GET /api/cart =================
// Returns the user's cart with product details
export async function GET() {
  try {
    const { error, userId } = await requireUserId();
    if (error) {
      return NextResponse.json(
        { error: "Unauthorized", items: [] },
        { status: 401 }
      );
    }

    // Fetch all cart items for this user, with product info
    const items = await prisma.cartItem.findMany({
      where: { userId },
      select: {
        id: true,
        qty: true,
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    console.log("[/api/cart][GET] items:", items);

    return NextResponse.json(
      { items },
      { status: 200 }
    );
  } catch (err) {
    console.error("[/api/cart][GET] ERROR:", err);
    return NextResponse.json(
      { error: "Server error", items: [] },
      { status: 500 }
    );
  }
}

// ================= POST /api/cart =================
// Request body: { productId: string, qty?: number }
// Adds to cart or increments qty.
export async function POST(req) {
  try {
    const { error, userId } = await requireUserId();
    if (error) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { productId, qty } = body || {};

    if (!productId) {
      return NextResponse.json(
        { error: "Missing productId" },
        { status: 400 }
      );
    }

    const addQty = typeof qty === "number" && qty > 0 ? qty : 1;

    // Check if this cart item already exists for that user + product
    const existing = await prisma.cartItem.findFirst({
      where: { userId, productId },
      select: { id: true, qty: true },
    });

    let updated;
    if (existing) {
      updated = await prisma.cartItem.update({
        where: { id: existing.id },
        data: { qty: existing.qty + addQty },
        select: {
          id: true,
          qty: true,
          productId: true,
        },
      });
    } else {
      updated = await prisma.cartItem.create({
        data: {
          userId,
          productId,
          qty: addQty,
        },
        select: {
          id: true,
          qty: true,
          productId: true,
        },
      });
    }

    console.log("[/api/cart][POST] updated:", updated);

    return NextResponse.json(
      { item: updated, message: "Cart updated" },
      { status: 200 }
    );
  } catch (err) {
    console.error("[/api/cart][POST] ERROR:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}

// ================= DELETE /api/cart =================
// Request body: { cartItemId?: string, productId?: string, removeAll?: boolean }
// - If removeAll = true: delete the row entirely
// - Else decrement qty by 1 (and delete row if it hits 0)
export async function DELETE(req) {
  try {
    const { error, userId } = await requireUserId();
    if (error) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { cartItemId, productId, removeAll } = body || {};

    // We'll locate one cartItem row owned by this user.
    let cartItem = null;

    if (cartItemId) {
      cartItem = await prisma.cartItem.findFirst({
        where: { id: cartItemId, userId },
        select: { id: true, qty: true },
      });
    } else if (productId) {
      cartItem = await prisma.cartItem.findFirst({
        where: { productId, userId },
        select: { id: true, qty: true },
      });
    }

    if (!cartItem) {
      return NextResponse.json(
        { error: "Item not found" },
        { status: 404 }
      );
    }

    if (removeAll || cartItem.qty <= 1) {
      await prisma.cartItem.delete({
        where: { id: cartItem.id },
      });
      console.log("[/api/cart][DELETE] removed entire row", cartItem.id);

      return NextResponse.json(
        { message: "Item removed" },
        { status: 200 }
      );
    }

    // else decrement qty
    const updated = await prisma.cartItem.update({
      where: { id: cartItem.id },
      data: { qty: cartItem.qty - 1 },
      select: { id: true, qty: true },
    });

    console.log("[/api/cart][DELETE] decremented:", updated);

    return NextResponse.json(
      { item: updated, message: "Item decremented" },
      { status: 200 }
    );
  } catch (err) {
    console.error("[/api/cart][DELETE] ERROR:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
