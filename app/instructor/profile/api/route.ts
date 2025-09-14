import { NextResponse, type NextRequest } from "next/server";
import clientPromise from "@/lib/mongodb";
import { MongoClient } from "mongodb";
import { createHash } from "crypto";
import { compare, hash } from "bcryptjs";

// Helper function to create a Gravatar URL for the user's avatar
const createGravatarUrl = (email: string) => {
  const trimmedEmail = email.trim().toLowerCase();
  const hash = createHash('md5').update(trimmedEmail).digest('hex');
  return `https://www.gravatar.com/avatar/${hash}?d=mp`;
};

// --- Handles GET requests to fetch profile data ---
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get("email");
    if (!email) return NextResponse.json({ message: "Email is required." }, { status: 400 });

    const client: MongoClient = await clientPromise;
    const db = client.db("test"); 
    const usersCollection = db.collection("users");

    const user = await usersCollection.findOne({ email, role: "instructor" });
    if (!user) return NextResponse.json({ message: `Instructor not found.` }, { status: 404 });

    const userProfile = {
      name: user.name || "N/A",
      email: user.email,
      role: user.role || "N/A",
      department: user.department || "N/A",
      joinDate: user.joinDate || new Date().toISOString(),
      avatarUrl: user.avatarUrl || createGravatarUrl(user.email),
      notificationSettings: user.notificationSettings || { emailOnNewIssuance: true, emailOnReturn: true, emailOnLowStock: false },
    };
    return NextResponse.json(userProfile);
  } catch (error) {
    console.error("Profile GET Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

// --- Handles POST requests to change the password ---
export async function POST(request: NextRequest) {
  try {
    const { email, currentPassword, newPassword } = await request.json();
    if (!email || !currentPassword || !newPassword) {
      return NextResponse.json({ message: "All password fields are required." }, { status: 400 });
    }

    const client: MongoClient = await clientPromise;
    const db = client.db("test");
    const usersCollection = db.collection("users");

    const user = await usersCollection.findOne({ email });
    if (!user) return NextResponse.json({ message: "User not found." }, { status: 404 });

    const isPasswordMatch = await compare(currentPassword, user.password);
    if (!isPasswordMatch) return NextResponse.json({ message: "Incorrect current password." }, { status: 401 });

    const hashedNewPassword = await hash(newPassword, 10);
    await usersCollection.updateOne({ _id: user._id }, { $set: { password: hashedNewPassword } });

    return NextResponse.json({ message: "Password updated successfully!" });
  } catch (error) {
    console.error("Change Password POST Error:", error);
    return NextResponse.json({ message: "An internal server error occurred." }, { status: 500 });
  }
}

// --- Handles PUT requests to update notification settings ---
export async function PUT(request: NextRequest) {
    try {
        const { email, settings } = await request.json();
        if (!email || !settings) {
          return NextResponse.json({ message: "Email and settings are required." }, { status: 400 });
        }
    
        const client: MongoClient = await clientPromise;
        const db = client.db("test");
        const usersCollection = db.collection("users");
    
        const result = await usersCollection.updateOne(
          { email },
          { $set: { notificationSettings: settings } }
        );
        if (result.matchedCount === 0) {
          return NextResponse.json({ message: "User not found." }, { status: 404 });
        }
    
        return NextResponse.json({ message: "Notification settings updated successfully!" });
      } catch (error) {
        console.error("Update Notifications PUT Error:", error);
        return NextResponse.json({ message: "An internal server error occurred." }, { status: 500 });
      }
}

