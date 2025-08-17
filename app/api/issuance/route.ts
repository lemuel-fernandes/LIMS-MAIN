import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

// GET: Fetch all issuance records
export async function GET(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const issuances = await db.collection("issuances").find({}).toArray();
    return NextResponse.json(issuances);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch issuances" },
      { status: 500 }
    );
  }
}

// POST: Add a new issuance record
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const client = await clientPromise;
    const db = client.db();
    const result = await db.collection("issuances").insertOne(data);
    return NextResponse.json({ insertedId: result.insertedId });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to add issuance" },
      { status: 500 }
    );
  }
}
