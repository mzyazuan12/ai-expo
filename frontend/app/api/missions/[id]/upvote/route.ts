import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const response = await fetch(`http://localhost:8001/missions/${params.id}/upvote`, {
      method: "POST",
    });

    if (!response.ok) {
      throw new Error("Failed to upvote mission");
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error upvoting mission:", error);
    return NextResponse.json(
      { error: "Failed to upvote mission" },
      { status: 500 }
    );
  }
} 