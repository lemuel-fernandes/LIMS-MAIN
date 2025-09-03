import { NextRequest, NextResponse } from "next/server";
import * as xlsx from "xlsx";
import clientPromise from "@/lib/mongodb";
import { Document, OptionalId } from "mongodb";

// Define a type for your equipment document for better type safety
interface EquipmentDocument extends Document {
  name: string;
  serialNo: string;
  purchaseDate: Date;
  labLocation: string;
  quantity: number;
  condition: string;
  remarks: string;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { message: "No file uploaded." },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    // FIX 1: Moved cellDates:true to the xlsx.read() function
    const workbook = xlsx.read(buffer, { type: "buffer", cellDates: true });

    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // The sheet_to_json call is now simpler
    const data: any[] = xlsx.utils.sheet_to_json(worksheet);

    if (data.length === 0) {
      return NextResponse.json(
        { message: "The Excel file is empty." },
        { status: 400 },
      );
    }

    const equipmentToInsert = data
      .map((row, index): EquipmentDocument | null => { // Added return type
        try {
          if (!row["Date of Purchase"] || !row["Equipment Details"]) {
            console.warn(`Skipping row ${index + 2} due to missing data.`);
            return null;
          }

          return {
            name: row["Equipment Details"],
            serialNo: row["Code No."],
            purchaseDate: row["Date of Purchase"],
            labLocation: row["Lab Location"],
            quantity: Number(row["No."]) || 0,
            condition: row["Condition"],
            remarks: row["Remarks"],
          };
        } catch (error) {
          console.error(`Error processing row ${index + 2}:`, error);
          return null;
        }
      })
      // FIX 2: Using a more explicit filter that TypeScript understands
      .filter((item): item is EquipmentDocument => item !== null);

    if (equipmentToInsert.length === 0) {
      return NextResponse.json(
        { message: "No valid data found to insert." },
        { status: 400 },
      );
    }

    const client = await clientPromise;
    const db = client.db("test");
    const collection = db.collection<EquipmentDocument>("equipments");

    await collection.insertMany(equipmentToInsert);

    return NextResponse.json(
      {
        message: `Successfully inserted ${equipmentToInsert.length} documents.`,
        totalRows: equipmentToInsert.length,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Upload failed:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred.";
    return NextResponse.json(
      { message: `An error occurred: ${errorMessage}` },
      { status: 500 },
    );
  }
}