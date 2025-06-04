import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";

export async function GET() {
  const { userId } = auth();
  
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const response = await fetch(`${process.env.BACKEND_URL}/whitelisted-users`, {
      headers: {
        "X-User-ID": userId,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch whitelisted users");
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching whitelisted users:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 