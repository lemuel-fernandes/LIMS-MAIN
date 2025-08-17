import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { hash } from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { email, password, role, designation } = await req.json();
    if (!email || !password || !role) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    const client = await clientPromise;
    const db = client.db();
    const existing = await db.collection("users").findOne({ email, role });
    if (existing) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 409 }
      );
    }
    const hashedPassword = await hash(password, 10);
    const user = {
      email,
      password: hashedPassword,
      role,
      designation:
        designation ||
        (role === "incharge" ? "Lab InCharge" : "Lab Instructor"),
      createdAt: new Date(),
    };
    await db.collection("users").insertOne(user);
    const { password: _, ...userData } = user;
    return NextResponse.json(userData);
  } catch (error) {
    return NextResponse.json({ error: "Signup failed" }, { status: 500 });
  }
}
