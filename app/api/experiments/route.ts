import { NextResponse, type NextRequest } from "next/server";
import clientPromise from "@/lib/mongodb";
import { MongoClient } from "mongodb";

// This function handles requests like GET /api/experiments?department=Computer%20Science&year=4
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const department = searchParams.get("department");
    const year = searchParams.get("year");

    if (!department || !year) {
      return NextResponse.json(
        { message: "Department and year query parameters are required" },
        { status: 400 }
      );
    }

    const client: MongoClient = await clientPromise;
    const db = client.db("test"); // Ensure this is your correct database name
    
    // NEW LOGIC: Directly query the flat 'experiments' collection
    const experimentsCollection = db.collection("experiments");

    // Find all experiments that match the student's department and year.
    const experiments = await experimentsCollection.find({
        department: { $regex: `^${department}$`, $options: 'i' },
        year: year // Match the year (assuming it's stored as a string like "1", "2", etc.)
    }).toArray();
    
    // If no experiments are found, it will correctly return an empty array.
    return NextResponse.json(experiments);

  } catch (error) {
    console.error("API Error fetching experiments:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

