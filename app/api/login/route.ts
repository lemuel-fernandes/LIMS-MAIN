import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { compare } from "bcryptjs"; // Used for securely comparing hashed passwords
import { MongoClient } from "mongodb";

/**
 * Handles POST requests to /api/login to authenticate a user.
 * Expects a JSON body with { email, password, role }.
 */
export async function POST(req: NextRequest) {
  try {
    const { email, password, role } = await req.json();

    if (!email || !password || !role) {
      return NextResponse.json(
        { error: "Email, password, and role are required." },
        { status: 400 } // Bad Request
      );
    }

    const client: MongoClient = await clientPromise;
    const db = client.db('test'); // Ensure this is your correct database name
    const usersCollection = db.collection("users");

    // Find the user by their email and role
    const user = await usersCollection.findOne({ email, role });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials or role." },
        { status: 401 } // Unauthorized
      );
    }

    // Safely compare the provided password with the stored password (hashed or plain)
    const isPasswordMatch = user.password
      ? await compare(password, user.password)
      : password === user.password;

    if (!isPasswordMatch) {
      return NextResponse.json(
        { error: "Invalid credentials or role." },
        { status: 401 } // Unauthorized
      );
    }

    // On success, remove the sensitive password field before sending the user data back
    const { password: _, ...userData } = user;

    return NextResponse.json(userData);

  } catch (error) {
    console.error("Login API Error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during login." },
      { status: 500 } // Internal Server Error
    );
  }
}

