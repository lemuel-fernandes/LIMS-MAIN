import { NextResponse, type NextRequest } from "next/server";
import clientPromise from "@/lib/mongodb";
import { MongoClient } from "mongodb";

// This function handles POST requests to update a user's notification settings
export async function POST(request: NextRequest) {
  try {
    const { email, settings } = await request.json();

    if (!email || !settings) {
      return NextResponse.json(
        { message: "Email and settings are required." },
        { status: 400 }
      );
    }

    const client: MongoClient = await clientPromise;
    const db = client.db("test");
    const usersCollection = db.collection("users");

    // Find the user by their email and update their notificationSettings field
    const result = await usersCollection.updateOne(
      { email },
      { $set: { notificationSettings: settings } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    return NextResponse.json({ message: "Notification settings updated successfully!" });

  } catch (error) {
    console.error("Update Notifications API Error:", error);
    return NextResponse.json(
      { message: "An internal server error occurred." },
      { status: 500 }
    );
  }
}
