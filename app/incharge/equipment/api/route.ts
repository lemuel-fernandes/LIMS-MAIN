import clientPromise from "@/lib/mongodb";
import type { MongoClient } from "mongodb";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const client = (await clientPromise) as MongoClient;
    const db = client.db("test");
    const equipment = await db.collection("equipments").find({}).toArray();
    return NextResponse.json(equipment);
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to fetch equipment" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const client = (await clientPromise) as MongoClient;
    const db = client.db();
    const result = await db.collection("equipment").insertOne(data);
    return NextResponse.json({ insertedId: result.insertedId });
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to add equipment" },
      { status: 500 }
    );
  }
}
