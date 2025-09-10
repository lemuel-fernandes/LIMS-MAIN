import { NextResponse, type NextRequest } from "next/server";
import clientPromise from "@/lib/mongodb";
import { MongoClient } from "mongodb";

// This function handles requests like GET /api/students/CS101
export async function GET(
  request: NextRequest,
  { params }: { params: { regNo: string } }
) {
  try {
    const { regNo } = params; // Extract the registration number from the URL, e.g., "CS101"

    if (!regNo) {
      return NextResponse.json(
        { message: "Registration number is required" },
        { status: 400 }
      );
    }

    const client: MongoClient = await clientPromise;
    // Connect to the 'test' database as you specified
    const db = client.db("test"); 
    // Look inside the 'students' collection
    const studentsCollection = db.collection("students");

    console.log(`API searching for regNo: ${regNo} in test.students`);

    // Find the student by their registration number.
    // Using a case-insensitive regex for flexibility (e.g., 'cs101' will match 'CS101')
    const student = await studentsCollection.findOne({ 
        regNo: { $regex: `^${regNo}$`, $options: 'i' } 
    });

    if (!student) {
      console.error(`Student with regNo: ${regNo} not found in database.`);
      return NextResponse.json(
        { message: "Student not found" },
        { status: 404 }
      );
    }

    console.log(`API found student:`, student);

    // Return the necessary fields to the frontend
    const studentDetails = {
        regNo: student.regNo,
        name: student.name,
        department: student.department,
        class: student.class || 'N/A', 
        team: student.team || 'N/A',
    };

    return NextResponse.json(studentDetails);
  } catch (error) {
    console.error("API Error fetching student:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
