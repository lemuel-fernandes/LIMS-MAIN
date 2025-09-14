import { NextResponse, type NextRequest } from "next/server";
import clientPromise from "@/lib/mongodb";
import { MongoClient, ObjectId } from "mongodb";

// --- Handles GET requests to fetch department data with global stats ---
export async function GET() {
  try {
    const client: MongoClient = await clientPromise;
    const db = client.db("test");
    const departmentsCollection = db.collection("departments");
    const equipmentsCollection = db.collection("equipments");
    const studentsCollection = db.collection("students");
    const issuancesCollection = db.collection("issuances");

    // Fetch all department documents (likely just one in your case)
    const departments = await departmentsCollection.find({}).toArray();

    // Perform three separate, efficient counts on the entire collections
    const totalEquipment = await equipmentsCollection.countDocuments();
    const totalStudents = await studentsCollection.countDocuments();
    const activeIssues = await issuancesCollection.countDocuments({ status: "Active" });

    // Add these global counts to each department document before returning
    const departmentsWithStats = departments.map(dept => ({
      ...dept,
      totalEquipment: totalEquipment,
      students: totalStudents,
      activeIssues: activeIssues,
    }));

    return NextResponse.json(departmentsWithStats);

  } catch (error: any) {
    console.error("API GET Error:", error);
    return NextResponse.json({ message: "Failed to fetch department data." }, { status: 500 });
  }
}

// --- Handles POST requests to create a new department ---
export async function POST(request: NextRequest) {
  try {
    const departmentData = await request.json();
    // Manually entered stats will be ignored; live stats are calculated by GET
    const { totalEquipment, students, activeIssues, ...rest } = departmentData;

    if (!rest.name || !rest.code) {
      return NextResponse.json({ message: "Department name and code are required." }, { status: 400 });
    }
    const client: MongoClient = await clientPromise;
    const db = client.db("test");
    const departmentsCollection = db.collection("departments");
    
    const result = await departmentsCollection.insertOne(rest);
    return NextResponse.json({ message: "Department added successfully", insertedId: result.insertedId }, { status: 201 });
  } catch (error: any) {
    console.error("API POST Error:", error);
    return NextResponse.json({ message: "Failed to add department." }, { status: 500 });
  }
}

// --- Handles PUT requests to update an existing department ---
export async function PUT(request: NextRequest) {
  try {
    const { _id, totalEquipment, students, activeIssues, ...updateData } = await request.json();
    if (!_id) {
      return NextResponse.json({ message: "Department ID is required for update." }, { status: 400 });
    }
    const client: MongoClient = await clientPromise;
    const db = client.db("test");
    const departmentsCollection = db.collection("departments");
    const result = await departmentsCollection.updateOne(
      { _id: new ObjectId(_id) },
      { $set: updateData }
    );
    if (result.matchedCount === 0) {
      return NextResponse.json({ message: "Department not found." }, { status: 404 });
    }
    return NextResponse.json({ message: "Department updated successfully" });
  } catch (error: any) {
    console.error("API PUT Error:", error);
    return NextResponse.json({ message: "Failed to update department." }, { status: 500 });
  }
}

// --- Handles DELETE requests to remove a department ---
export async function DELETE(request: NextRequest) {
  try {
    const { _id } = await request.json();
    if (!_id) {
      return NextResponse.json({ message: "Department ID is required for deletion." }, { status: 400 });
    }
    const client: MongoClient = await clientPromise;
    const db = client.db("test");
    const departmentsCollection = db.collection("departments");
    const result = await departmentsCollection.deleteOne({ _id: new ObjectId(_id) });
    if (result.deletedCount === 0) {
      return NextResponse.json({ message: "Department not found." }, { status: 404 });
    }
    return NextResponse.json({ message: "Department deleted successfully" });
  } catch (error: any) {
    console.error("API DELETE Error:", error);
    return NextResponse.json({ message: "Failed to delete department." }, { status: 500 });
  }
}

