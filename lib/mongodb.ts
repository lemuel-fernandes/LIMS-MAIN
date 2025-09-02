// lib/mongodb.ts
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI as string; // e.g. "mongodb://127.0.0.1:27017/mydb"
console.log("MongoDB URI:", uri);
const options = {};

if (!uri) {
  throw new Error("Please add your Mongo URI to .env.local");
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  // In dev mode, use a global variable so we don't create multiple connections
  if (!(global as any)._mongoClientPromise) {
    client = new MongoClient(uri, options);
    (global as any)._mongoClientPromise = client.connect();
  }
  clientPromise = (global as any)._mongoClientPromise;
} else {
  // In prod, just create one connection
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;
