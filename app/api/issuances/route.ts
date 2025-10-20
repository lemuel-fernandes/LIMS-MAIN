import { NextResponse, type NextRequest } from "next/server";
import clientPromise from "@/lib/mongodb";
import { MongoClient, ObjectId } from "mongodb";

// --- Handles GET requests for ALL issuances or a SINGLE issuance by ID ---
export async function GET(request: NextRequest) {
  try {
    const client: MongoClient = await clientPromise;
    const db = client.db("test");
    const issuancesCollection = db.collection("issuances");
    
    const id = request.nextUrl.searchParams.get("id");
    
    // Logic to fetch a single issuance by its ID
    if (id) {
        if (!ObjectId.isValid(id)) {
            return NextResponse.json({ message: "Invalid Issuance ID." }, { status: 400 });
        }
        const issuance = await issuancesCollection.aggregate([
            { $match: { _id: new ObjectId(id) } },
            { $lookup: { from: "students", localField: "studentRegNo", foreignField: "regNo", as: "studentDetails" } },
            { $lookup: { from: "equipments", localField: "equipmentIds", foreignField: "_id", as: "equipmentDetails" } },
            { $unwind: { path: "$studentDetails", preserveNullAndEmptyArrays: true } }
        ]).toArray();

        if (issuance.length === 0) {
            return NextResponse.json({ message: "Issuance not found." }, { status: 404 });
        }
        return NextResponse.json(issuance[0]);
    }

    // Logic to fetch all issuances if no ID is provided
    const allIssuances = await issuancesCollection.aggregate([
      { $lookup: { from: "students", localField: "studentRegNo", foreignField: "regNo", as: "studentDetails" } },
      { $lookup: { from: "equipments", localField: "equipmentIds", foreignField: "_id", as: "equipmentDetails" } },
      { $unwind: { path: "$studentDetails", preserveNullAndEmptyArrays: true } },
      { $sort: { issuanceDate: -1 } }
    ]).toArray();

    return NextResponse.json(allIssuances);

  } catch (error: any) {
    console.error("API GET Error (Issuances):", error);
    return NextResponse.json({ message: "Failed to fetch issuance records." }, { status: 500 });
  }
}


// --- Handles POST requests to create a new issuance (Standard or Custom) ---
export async function POST(request: NextRequest) {
  const client: MongoClient = await clientPromise;
  const session = client.startSession();
  try {
    await session.startTransaction();
    const { studentRegNo, experimentId, equipmentIds } = await request.json();
    if (!studentRegNo) throw new Error("Student registration number is required.");

    const db = client.db("test");
    const equipmentCollection = db.collection("equipments");
    const issuancesCollection = db.collection("issuances");
    
    let issuedEquipmentIds: ObjectId[] = [];
    let issuanceName = "";

    if (experimentId) { // Standard Issuance
        const experimentsCollection = db.collection("experiments");
        const experiment = await experimentsCollection.findOne({ _id: new ObjectId(experimentId) }, { session });
        if (!experiment) throw new Error("Experiment not found.");
        issuanceName = experiment.name;
        for (const req of experiment.requiredEquipment) {
            const availableItems = await equipmentCollection.find({ name: req.name, condition: "Working", status: { $ne: "Issued" } }, { session }).limit(req.quantity).toArray();
            if (availableItems.length < req.quantity) throw new Error(`Not enough available units of ${req.name}.`);
            issuedEquipmentIds.push(...availableItems.map((item: any) => item._id));
        }
    } else if (equipmentIds && Array.isArray(equipmentIds) && equipmentIds.length > 0) { // Custom Issuance
        issuanceName = "Custom Issuance";
        const objectIds = equipmentIds.map(id => new ObjectId(id));
        const itemsToIssue = await equipmentCollection.find({ _id: { $in: objectIds }, condition: "Working", status: { $ne: "Issued" } }, { session }).toArray();
        if (itemsToIssue.length !== equipmentIds.length) throw new Error("One or more selected items are no longer available.");
        issuedEquipmentIds = itemsToIssue.map((item: any) => item._id);
    } else {
        throw new Error("Request must include either an experiment ID or a list of equipment IDs.");
    }

    await equipmentCollection.updateMany({ _id: { $in: issuedEquipmentIds } }, { $set: { status: "Issued", issuedTo: studentRegNo, issuedDate: new Date() } }, { session });
    
    const issuanceRecord = {
      studentRegNo,
      experimentId: experimentId ? new ObjectId(experimentId) : null,
      experimentName: issuanceName,
      equipmentIds: issuedEquipmentIds,
      issuanceDate: new Date(),
      returnDate: null,
      status: "Active"
    };

    await issuancesCollection.insertOne(issuanceRecord, { session });
    await session.commitTransaction();
    return NextResponse.json({ message: "Issuance recorded successfully!" });
  } catch (error: any) {
    if (session.inTransaction()) await session.abortTransaction();
    console.error("API POST Error (Issuances):", error.message);
    return NextResponse.json({ message: error.message || "Failed to record issuance." }, { status: 500 });
  } finally {
    session.endSession();
  }
}

// --- Handles PUT requests to update an issuance to 'Returned' ---
export async function PUT(request: NextRequest) {
  const client: MongoClient = await clientPromise;
  const session = client.startSession();
  try {
    await session.startTransaction();
    const { issuanceId } = await request.json();
    if (!issuanceId) throw new Error("Issuance ID is required to process a return.");
    const db = client.db("test");
    const issuancesCollection = db.collection("issuances");
    const equipmentCollection = db.collection("equipments");
    const issuanceToReturn = await issuancesCollection.findOne({ _id: new ObjectId(issuanceId) }, { session });
    if (!issuanceToReturn) throw new Error("Issuance record not found.");
    if (issuanceToReturn.status === "Returned") throw new Error("This equipment has already been returned.");
    await equipmentCollection.updateMany({ _id: { $in: issuanceToReturn.equipmentIds } }, { $set: { status: "Available" }, $unset: { issuedTo: "", issuedDate: "" } }, { session });
    await issuancesCollection.updateOne({ _id: new ObjectId(issuanceId) }, { $set: { status: "Returned", returnDate: new Date() } }, { session });
    await session.commitTransaction();
    return NextResponse.json({ message: "Equipment returned successfully!" });
  } catch (error: any) {
    if (session.inTransaction()) await session.abortTransaction();
    console.error("API PUT Error (Issuances):", error);
    return NextResponse.json({ message: error.message || "Failed to return equipment." }, { status: 500 });
  } finally {
    session.endSession();
  }
}

