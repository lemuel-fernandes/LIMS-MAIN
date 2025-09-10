import clientPromise from "@/lib/mongodb";
import type { MongoClient } from "mongodb";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const client = (await clientPromise) as MongoClient;
    const db = client.db("test"); 
    
    // CORRECTED: Using the correct plural collection name 'equipments'
    const equipment = await db.collection("equipments").find({}).toArray(); 
    
    return NextResponse.json(equipment);
  } catch (e) {
    console.error("GET Error in /incharge/equipment/api:", e);
    return NextResponse.json(
      { error: "Failed to fetch equipment" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    const newEquipment = {
      ...data,
      status: "Available"
    };

    const client = (await clientPromise) as MongoClient;
    const db = client.db("test");
    
    // CORRECTED: Using the correct plural collection name 'equipments'
    const result = await db.collection("equipments").insertOne(newEquipment);
    
    return NextResponse.json({ insertedId: result.insertedId });
  } catch (e) {
    console.error("POST Error in /incharge/equipment/api:", e);
    return NextResponse.json(
      { error: "Failed to add equipment" },
      { status: 500 }
    );
  }
}

