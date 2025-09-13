import { NextResponse, type NextRequest } from "next/server";
import clientPromise from "@/lib/mongodb";
import { MongoClient } from "mongodb";
import { compare, hash } from "bcryptjs"; // Import bcrypt for hashing and comparison

export async function POST(request: NextRequest) {
  try {
    const { email, currentPassword, newPassword } = await request.json();

    if (!email || !currentPassword || !newPassword) {
      return NextResponse.json({ message: "All password fields are required." }, { status: 400 });
    }

    const client: MongoClient = await clientPromise;
    const db = client.db("test");
    const usersCollection = db.collection("users");

    // 1. Find the user by their email
    const user = await usersCollection.findOne({ email });
    if (!user) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    // 2. Verify their current password
    const isPasswordMatch = await compare(currentPassword, user.password);
    if (!isPasswordMatch) {
      return NextResponse.json({ message: "Incorrect current password." }, { status: 401 }); // Unauthorized
    }

    // 3. Hash the new password for secure storage
    const hashedNewPassword = await hash(newPassword, 10); // 10 is the salt rounds

    // 4. Update the user's document with the new hashed password
    await usersCollection.updateOne(
      { _id: user._id },
      { $set: { password: hashedNewPassword } }
    );

    return NextResponse.json({ message: "Password updated successfully!" });

  } catch (error) {
    console.error("Change Password API Error:", error);
    return NextResponse.json({ message: "An internal server error occurred." }, { status: 500 });
  }
}
