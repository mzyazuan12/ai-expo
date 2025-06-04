import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(request: Request) {
  try {
    const { userId } = getAuth(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const { db } = await connectToDatabase();

    const challenge = {
      ...data,
      author_uid: userId,
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      state: "draft",
      upvotes: 0,
      solutions: [],
      redactions: [],
      moderators: [],
      verification_required: data.classification_level !== "unclassified",
      allowed_provider_types: data.allowed_provider_types || ["academia", "startup", "industry"],
      tags: Array.isArray(data.tags) ? data.tags : data.tags ? data.tags.split(',').map((tag: string) => tag.trim()) : [],
      video_url: data.video_url || null,
      threats: data.threats ? data.threats.split(',').map((threat: string) => threat.trim()) : [],
      wind_kts: data.wind_kts || null,
      laps: data.laps || null,
      environment: data.environment || "general",
      required_clearance_level: data.required_clearance_level || null,
      review_notes: null
    };

    const result = await db.collection("challenges").insertOne(challenge);
    return NextResponse.json({
      ...challenge,
      _id: result.insertedId.toString()
    });
  } catch (error) {
    console.error("Error creating challenge:", error);
    return NextResponse.json(
      { error: "Failed to create challenge" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { db } = await connectToDatabase();
    const challenges = await db.collection("challenges")
      .find({})
      .sort({ created: -1 })
      .toArray();

    return NextResponse.json(challenges.map(challenge => ({
      ...challenge,
      _id: challenge._id.toString()
    })));
  } catch (error) {
    console.error("Error fetching challenges:", error);
    return NextResponse.json(
      { error: "Failed to fetch challenges" },
      { status: 500 }
    );
  }
}