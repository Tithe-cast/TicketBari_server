import { MongoClient, ServerApiVersion } from "mongodb";

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mongodb.net/?retryWrites=true&w=majority`;

export const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let db;

export const connectDB = async () => {
  try {
    await client.connect();
    db = client.db(process.env.DB_NAME || "ticketBariDB");
    await db.command({ ping: 1 });
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

export const getDB = () => {
  if (!db) {
    throw new Error("Database not initialized. Call connectDB() first.");
  }
  return db;
};

// Collection helpers — keeps controllers free of magic strings
export const usersCollection = () => getDB().collection("users");
export const ticketsCollection = () => getDB().collection("tickets");
export const bookingsCollection = () => getDB().collection("bookings");
export const paymentsCollection = () => getDB().collection("payments");
