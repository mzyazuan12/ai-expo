import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { state } = await request.json();

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/challenges/${params.id}/state?state=${state}`,
      {
        method: "POST",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to update challenge state");
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error updating challenge state:", error);
    return NextResponse.json(
      { error: "Failed to update challenge state" },
      { status: 500 }
    );
  }
} 