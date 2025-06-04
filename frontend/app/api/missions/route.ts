import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch("http://localhost:8001/missions");
    if (!response.ok) {
      throw new Error("Failed to fetch missions");
    }
    const data = await response.json();
  return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching missions:", error);
    return NextResponse.json(
      { error: "Failed to fetch missions" },
      { status: 500 }
    );
  }
} 