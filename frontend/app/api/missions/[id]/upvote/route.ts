import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { connectToDatabase } from "@/lib/mongodb";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = getAuth(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    
    // Check if user has already upvoted
    const mission = await db.collection("missions").findOne({
      _id: params.id,
      upvoted_by: userId
    });

    if (mission) {
      return NextResponse.json({ error: "Already upvoted" }, { status: 400 });
    }

    // Add upvote and track who upvoted
    const result = await db.collection("missions").updateOne(
      { _id: params.id },
      {
        $inc: { upvotes: 1 },
        $push: { upvoted_by: userId }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Mission not found" }, { status: 404 });
    }

    // Get updated mission
    const updatedMission = await db.collection("missions").findOne({ _id: params.id });
    return NextResponse.json(updatedMission);
  } catch (error) {
    console.error("Error upvoting mission:", error);
    return NextResponse.json(
      { error: "Failed to upvote mission" },
      { status: 500 }
    );
  }
} 