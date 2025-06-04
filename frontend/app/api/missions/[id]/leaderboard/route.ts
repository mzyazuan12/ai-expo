import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { db } = await connectToDatabase();
    const mission = await db.collection("missions").findOne({ 
      _id: new ObjectId(params.id)
    });

    if (!mission) {
      return NextResponse.json({ error: "Mission not found" }, { status: 404 });
    }

    // Sort scores by lap time
    const sortedScores = mission.scores?.sort((a: any, b: any) => a.lap_time_sec - b.lap_time_sec) || [];

    return NextResponse.json(sortedScores.map((score: any) => ({
      ...score,
      _id: score._id?.toString(),
      mission_id: mission._id.toString()
    })));
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
} 