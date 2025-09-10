import { NextResponse, type NextRequest } from "next/server";
import clientPromise from "@/lib/mongodb";
import { MongoClient } from "mongodb";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { message: "Email query parameter is required" },
        { status: 400 }
      );
    }

    const client: MongoClient = await clientPromise;
    const db = client.db("test"); 
    const usersCollection = db.collection("users");

    const user = await usersCollection.findOne({ email });

    if (!user) {
      return NextResponse.json(
        { message: `User with email "${email}" not found.` },
        { status: 404 }
      );
    }

    // Prepare the user profile data to send back to the frontend
    const userProfile = {
      name: user.name || "N/A",
      email: user.email,
      role: user.role || "N/A",
      department: user.department || "N/A",
      joinDate: user.joinDate || new Date().toISOString(),
      avatarUrl: `https://placehold.co/128x128/E0E7FF/4F46E5?text=${
        user.name
          ? user.name.split(" ").map((n: string) => n[0]).join("")
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
