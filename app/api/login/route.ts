import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { compare } from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { email, password, role } = await req.json();
    const client = await clientPromise;
    const db = client.db();
    const user = await db.collection("users").findOne({ email, role });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }
    // If passwords are hashed, use bcryptjs compare
    const passwordMatch = user.password
      ? await compare(password, user.password)
      : password === user.password;
    if (!passwordMatch) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }
    // Remove sensitive info
    const { password: _, ...userData } = user;
    return NextResponse.json(userData);
  } catch (error) {
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
