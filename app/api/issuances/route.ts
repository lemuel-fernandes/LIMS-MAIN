import { NextResponse, type NextRequest } from "next/server";
import clientPromise from "@/lib/mongodb";
import { MongoClient, ObjectId } from "mongodb";

// This function handles POST requests to /api/issuances
export async function POST(request: NextRequest) {
  const client: MongoClient = await clientPromise;
  const session = client.startSession();
  console.log("[Issuance API] Received POST request. Starting transaction.");

  try {
    session.startTransaction();

    const { studentRegNo, experimentId } = await request.json();

    if (!studentRegNo || !experimentId) {
      throw new Error("Student registration number and experiment ID are required.");
    }
    console.log(`[Issuance API] Processing for Student: ${studentRegNo}, Experiment ID: ${experimentId}`);

    const db = client.db("test");
    const experimentsCollection = db.collection("experiments");
    // CORRECTED: Using the correct plural collection name 'equipments'
    const equipmentCollection = db.collection("equipments");
    const issuancesCollection = db.collection("issuances");

    const experiment = await experimentsCollection.findOne(
      { _id: new ObjectId(experimentId) },
      { session }
    );

    if (!experiment) {
      throw new Error("Experiment not found.");
    }
    console.log(`[Issuance API] Found experiment: "${experiment.name}"`);

    const issuedEquipmentIds: ObjectId[] = [];
    for (const req of experiment.requiredEquipment) {
      console.log(`[Issuance API] Checking availability for: ${req.quantity}x ${req.name}`);
      const availableItems = await equipmentCollection.find({
        name: req.name,
        condition: "Working",
        status: { $ne: "Issued" }
      }, { session }).limit(req.quantity).toArray();

      console.log(`[Issuance API] Found ${availableItems.length} available units.`);
      if (availableItems.length < req.quantity) {
        throw new Error(`Not enough available units of ${req.name}. Required: ${req.quantity}, Available: ${availableItems.length}.`);
      }
      
      issuedEquipmentIds.push(...availableItems.map(item => item._id));
    }

    console.log(`[Issuance API] All equipment available. Updating ${issuedEquipmentIds.length} items to 'Issued'.`);
    await equipmentCollection.updateMany(
      { _id: { $in: issuedEquipmentIds } },
      { $set: { status: "Issued", issuedTo: studentRegNo, issuedDate: new Date() } },
      { session }
    );
    
    console.log("[Issuance API] Creating new issuance record.");
    const issuanceRecord = {
      studentRegNo,
      experimentId: new ObjectId(experimentId),
      experimentName: experiment.name,
      equipmentIds: issuedEquipmentIds,
      issuanceDate: new Date(),
      returnDate: null,
      status: "Active"
    };

    await issuancesCollection.insertOne(issuanceRecord, { session });

    await session.commitTransaction();
    console.log("[Issuance API] Transaction committed successfully.");

    return NextResponse.json({ message: "Issuance recorded successfully!" });

  } catch (error: any) {
    if (session.inTransaction()) {
      await session.abortTransaction();
      console.error("[Issuance API] Transaction aborted due to error.");
    }
    console.error("[Issuance API] Issuance failed:", error.message);
    return NextResponse.json(
      { message: error.message || "Failed to record issuance." },
      { status: 500 }
    );
  } finally {
    session.endSession();
    console.log("[Issuance API] MongoDB session ended.");
  }
}

