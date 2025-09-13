import { NextResponse, type NextRequest } from "next/server";
import clientPromise from "@/lib/mongodb";
import { MongoClient, ObjectId } from "mongodb";

// This function handles POST requests to return a set of issued equipment
export async function POST(request: NextRequest) {
  const client: MongoClient = await clientPromise;
  const session = client.startSession();

  try {
    // Start a transaction to ensure all operations succeed or fail together
    await session.startTransaction();
    const { issuanceId } = await request.json();

    if (!issuanceId) {
      throw new Error("Issuance ID is required to process a return.");
    }

    const db = client.db("test");
    const issuancesCollection = db.collection("issuances");
    const equipmentCollection = db.collection("equipments");

    const issuanceToReturn = await issuancesCollection.findOne({ _id: new ObjectId(issuanceId) }, { session });

    if (!issuanceToReturn) {
      throw new Error("Issuance record not found.");
    }
    if (issuanceToReturn.status === "Returned") {
      throw new Error("This equipment has already been returned.");
    }

    // Update all associated equipment items back to 'Available'
    await equipmentCollection.updateMany(
      { _id: { $in: issuanceToReturn.equipmentIds } },
      { $set: { status: "Available" }, $unset: { issuedTo: "", issuedDate: "" } },
      { session }
    );

    // Update the issuance record itself to mark it as returned
    await issuancesCollection.updateOne(
      { _id: new ObjectId(issuanceId) },
      { $set: { status: "Returned", returnDate: new Date() } },
      { session }
    );

    await session.commitTransaction();

    return NextResponse.json({ message: "Equipment returned successfully!" });

  } catch (error: any) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    console.error("Return failed:", error);
    return NextResponse.json({ message: error.message || "Failed to return equipment." }, { status: 500 });
  } finally {
    session.endSession();
  }
}

