import { NextResponse, type NextRequest } from "next/server";
import clientPromise from "@/lib/mongodb";
import { MongoClient } from "mongodb";

export async function GET(request: NextRequest) {
  try {
    // 1. Get the email from the URL query parameters sent by the profile page
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get("email");

    // 2. Handle cases where the email is not provided
    if (!email) {
      return NextResponse.json(
        { message: "Email query parameter is required" },
        { status: 400 } // Bad Request
      );
    }

    const client: MongoClient = await clientPromise;
    const db = client.db("test"); // Target the 'test' database
    const usersCollection = db.collection("users"); // Target the 'users' collection

    // 3. Use the provided email to find the user in the database
    const user = await usersCollection.findOne({ email });

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    // Map the MongoDB document to the UserProfile type expected by the frontend
    const userProfile = {
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      joinDate: user.joinDate,
      // Create a placeholder avatar from the user's initials
      avatarUrl: `https://placehold.co/128x128/E0E7FF/4F46E5?text=${
        user.name
          ? user.name
              .split(" ")
              .map((n: string) => n[0])
              .join("")
          : "U"
      }`,
    };

    return NextResponse.json(userProfile);
  } catch (error) {
    console.error("API Error fetching profile:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
