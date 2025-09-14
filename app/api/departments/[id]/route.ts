import { NextResponse, type NextRequest } from "next/server";
import clientPromise from "@/lib/mongodb";
import { MongoClient, ObjectId } from "mongodb";

// This function handles requests like GET /api/departments/68c1b...
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params; // Extract the department ID from the URL

    if (!id) {
      return NextResponse.json(
        { message: "Department ID is required" },
        { status: 400 }
      );
    }

    const client: MongoClient = await clientPromise;
    const db = client.db("test"); 
    const departmentsCollection = db.collection("departments");

    // Use an aggregation pipeline to find the department and join its experiments
    const departmentData = await departmentsCollection.aggregate([
      // Stage 1: Match the specific department by its _id
      {
        $match: {
          _id: new ObjectId(id)
        }
      },
      // Stage 2: Look up all experiments that match this department's name
      {
        $lookup: {
          from: "experiments",
          localField: "name",
          foreignField: "department",
          as: "experiments"
        }
      }
    ]).toArray();

    if (!departmentData || departmentData.length === 0) {
      return NextResponse.json(
        { message: "Department not found" },
        { status: 404 }
      );
    }

    // Return the first (and only) result
    return NextResponse.json(departmentData[0]);

  } catch (error: any) {
    console.error("API Error fetching single department:", error);
    return NextResponse.json(
      { message: "Failed to fetch department data.", error: error.message },
      { status: 500 }
    );
  }
}
