import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { MongoClient } from "mongodb";

// This function handles GET requests to /api/students
export async function GET() {
  try {
    const client: MongoClient = await clientPromise;
    const db = client.db("test"); // Ensure this is your correct database name
    const studentsCollection = db.collection("students");

    // Fetch all documents from the students collection
    const students = await studentsCollection.find({}).toArray();

    return NextResponse.json(students);

  } catch (error: any) {
    console.error("API Error fetching all students:", error);
    return NextResponse.json(
      { message: "Failed to fetch student records.", error: error.message },
      { status: 500 }
    );
  }
}

