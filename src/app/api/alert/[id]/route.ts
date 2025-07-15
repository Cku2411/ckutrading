// app/api/alerts/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Params {
  params: { id: string };
}

// PUT /api/alerts/:id
export async function PUT(request: Request, { params }: Params) {
  const id = Number(params.id);
  if (isNaN(id)) {
    return new NextResponse("Invalid ID", { status: 400 });
  }

  try {
    const { targetPrice, direction, isActive } = await request.json();

    const updated = await prisma.alert.update({
      where: { id },
      data: {
        ...(typeof targetPrice === "number" && { targetPrice }),
        ...(direction && { direction }),
        ...(typeof isActive === "boolean" && { isActive }),
      },
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error(`PUT /api/alerts/${id} error`, error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// DELETE /api/alerts/:id
export async function DELETE(_request: Request, { params }: Params) {
  const id = Number(params.id);
  if (isNaN(id)) {
    return new NextResponse("Invalid ID", { status: 400 });
  }

  try {
    await prisma.alert.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(`DELETE /api/alerts/${id} error`, error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
