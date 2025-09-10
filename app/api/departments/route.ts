import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { MongoClient } from "mongodb";

// This function fetches all departments and uses MongoDB's aggregation
// pipeline to join them with their corresponding experiments.
export async function GET() {
  try {
    const client: MongoClient = await clientPromise;
    const db = client.db("test"); // Ensure this is your correct database name
    const departmentsCollection = db.collection("departments");

    // The aggregation pipeline will fetch each department and then
    // look up all experiments that match that department's name.
    const departmentsWithExperiments = await departmentsCollection.aggregate([
      {
        $lookup: {
          from: "experiments",         // The collection to join with
          localField: "name",            // Field from the departments collection
          foreignField: "department",    // Field from the experiments collection
          as: "experiments"            // The name for the new array field
        }
      }
    ]).toArray();

    return NextResponse.json(departmentsWithExperiments);

  } catch (error: any) {
    console.error("API Error fetching departments:", error);
    return NextResponse.json(
      { message: "Failed to fetch department data.", error: error.message },
      { status: 500 }
    );
  }
}

