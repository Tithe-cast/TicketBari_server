// One-time helper: promotes an already-registered user to "admin".
// Run AFTER you have registered normally on the site at least once.
//
// Usage:
//   node scripts/makeFirstAdmin.js admin@ticketbari.com
//
import "dotenv/config";
import { connectDB, usersCollection, client } from "../config/db.js";

const email = process.argv[2];

if (!email) {
  console.error("Usage: node scripts/makeFirstAdmin.js <email>");
  process.exit(1);
}

const run = async () => {
  await connectDB();
  const result = await usersCollection().updateOne(
    { email },
    { $set: { role: "admin" } }
  );

  if (result.matchedCount === 0) {
    console.error(`No user found with email "${email}". Register on the site first.`);
  } else {
    console.log(`✅ ${email} is now an admin.`);
  }

  await client.close();
  process.exit(0);
};

run();
