import { NextResponse, type NextRequest } from "next/server";
import clientPromise from "@/lib/mongodb";
import { MongoClient, ObjectId } from "mongodb";

// --- Function to GET all issuance records ---
export async function GET() {
  try {
    const client: MongoClient = await clientPromise;
    const db = client.db("test");
    const issuancesCollection = db.collection("issuances");

    const issuances = await issuancesCollection.aggregate([
      { $lookup: { from: "students", localField: "studentRegNo", foreignField: "regNo", as: "studentDetails" } },
      { $lookup: { from: "equipments", localField: "equipmentIds", foreignField: "_id", as: "equipmentDetails" } },
      { $lookup: { from: "experiments", localField: "experimentId", foreignField: "_id", as: "experimentDetails" } },
      { $unwind: { path: "$studentDetails", preserveNullAndEmptyArrays: true } },
      { $unwind: { path: "$experimentDetails", preserveNullAndEmptyArrays: true } },
      { $sort: { issuanceDate: -1 } }
    ]).toArray();

    return NextResponse.json(issuances);
  } catch (error: any) {
    console.error("API Error fetching issuances:", error);
    return NextResponse.json({ message: "Failed to fetch issuance records.", error: error.message }, { status: 500 });
  }
}


// --- Function to POST a new issuance record ---
export async function POST(request: NextRequest) {
  const client: MongoClient = await clientPromise;
  const session = client.startSession();

  try {
    await session.startTransaction();
    const { studentRegNo, experimentId, equipmentIds } = await request.json();

    if (!studentRegNo) {
      throw new Error("Student registration number is required.");
    }

    const db = client.db("test");
    const equipmentCollection = db.collection("equipments");
    const issuancesCollection = db.collection("issuances");
    
    let issuedEquipmentIds: ObjectId[] = [];
    let issuanceName = "";

    // --- LOGIC FOR STANDARD EXPERIMENT ISSUANCE ---
    if (experimentId) {
        const experimentsCollection = db.collection("experiments");
        const experiment = await experimentsCollection.findOne({ _id: new ObjectId(experimentId) }, { session });
        if (!experiment) throw new Error("Experiment not found.");
        issuanceName = experiment.name;

        for (const req of experiment.requiredEquipment) {
            const availableItems = await equipmentCollection.find({
                name: req.name, condition: "Working", status: { $ne: "Issued" }
            }, { session }).limit(req.quantity).toArray();

            if (availableItems.length < req.quantity) {
                throw new Error(`Not enough available units of ${req.name}.`);
            }
            issuedEquipmentIds.push(...availableItems.map((item: any) => item._id));
        }
    } 
    // --- LOGIC FOR CUSTOM ISSUANCE ---
    else if (equipmentIds && Array.isArray(equipmentIds) && equipmentIds.length > 0) {
        issuanceName = "Custom Issuance";
        const objectIds = equipmentIds.map(id => new ObjectId(id));

        const itemsToIssue = await equipmentCollection.find({
            _id: { $in: objectIds }, condition: "Working", status: { $ne: "Issued" }
        }, { session }).toArray();

        if (itemsToIssue.length !== equipmentIds.length) {
            throw new Error("One or more selected items are no longer available.");
        }
        issuedEquipmentIds = itemsToIssue.map((item: any) => item._id);
    } 
    else {
        throw new Error("Request must include either an experiment ID or a list of equipment IDs.");
    }

    // --- DB Updates (common for both types) ---
    await equipmentCollection.updateMany(
      { _id: { $in: issuedEquipmentIds } },
      { $set: { status: "Issued", issuedTo: studentRegNo, issuedDate: new Date() } },
      { session }
    );
    
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
    console.error("Issuance failed:", error.message);
    return NextResponse.json({ message: error.message || "Failed to record issuance." }, { status: 500 });
  } finally {
    session.endSession();
  }
}

// --- Function to PUT (update) an issuance to 'Returned' ---
export async function PUT(request: NextRequest) {
  const client: MongoClient = await clientPromise;
  const session = client.startSession();

  try {
    await session.startTransaction();
    const { issuanceId } = await request.json();

    if (!issuanceId) {
      throw new Error("Issuance ID is required to process a return.");
    }

    const db = client.db("test");
    const issuancesCollection = db.collection("issuances");
    const equipmentCollection = db.collection("equipments");

    const issuanceToReturn = await issuancesCollection.findOne({ _id: new ObjectId(issuanceId) }, { session });
    if (!issuanceToReturn) throw new Error("Issuance record not found.");
    if (issuanceToReturn.status === "Returned") throw new Error("This equipment has already been returned.");

    await equipmentCollection.updateMany(
      { _id: { $in: issuanceToReturn.equipmentIds } },
      { $set: { status: "Available" }, $unset: { issuedTo: "", issuedDate: "" } },
      { session }
    );

    await issuancesCollection.updateOne(
      { _id: new ObjectId(issuanceId) },
      { $set: { status: "Returned", returnDate: new Date() } },
      { session }
    );

    await session.commitTransaction();

    return NextResponse.json({ message: "Equipment returned successfully!" });

  } catch (error: any) {
    if (session.inTransaction()) await session.abortTransaction();
    console.error("Return failed:", error);
    return NextResponse.json({ message: error.message || "Failed to return equipment." }, { status: 500 });
  } finally {
    session.endSession();
  }
}

