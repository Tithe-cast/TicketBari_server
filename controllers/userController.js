import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import { fromNodeHeaders } from "better-auth/node";
import { usersCollection, ticketsCollection } from "../config/db.js";
import { getAuth } from "../lib/auth.js";

// POST /jwt — issue our resource-API JWT, but only after confirming a real
// BetterAuth session exists for this request (cookie is sent automatically
// by the authClient on the client side).
export const issueJWT = async (req, res) => {
  const auth = getAuth();
  const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });

  if (!session?.user?.email) {
    return res.status(401).send({ message: "No active session" });
  }

  const token = jwt.sign({ email: session.user.email }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "7d",
  });

  res.send({ token });
};

// POST /users — called once right after BetterAuth registration/social login
// to make sure our app-specific fields (role, fraud) exist for this user.
// Reads the verified session rather than trusting the request body.
export const syncUser = async (req, res) => {
  const auth = getAuth();
  const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });

  if (!session?.user?.email) {
    return res.status(401).send({ message: "No active session" });
  }

  const existing = await usersCollection().findOne({ email: session.user.email });
  if (existing) {
    return res.send({ message: "User already exists", inserted: false });
  }

  const newUser = {
    name: session.user.name,
    email: session.user.email,
    photoURL: session.user.image || "",
    role: "user",
    fraud: false,
    createdAt: new Date(),
  };

  const result = await usersCollection().insertOne(newUser);
  res.send(result);
};

// GET /users/role/:email — used by the client to decide which dashboard/route to show
export const getUserRole = async (req, res) => {
  const email = req.params.email;
  const user = await usersCollection().findOne({ email });

  if (!user) return res.status(404).send({ message: "User not found" });

  res.send({ role: user.role, fraud: !!user.fraud });
};

// GET /users/:email — profile page info
export const getSingleUser = async (req, res) => {
  const email = req.params.email;
  const user = await usersCollection().findOne({ email });

  if (!user) return res.status(404).send({ message: "User not found" });
  res.send(user);
};

// GET /users — admin only, full user table
export const getAllUsers = async (req, res) => {
  const search = req.query.search || "";
  const query = search
    ? { $or: [{ name: { $regex: search, $options: "i" } }, { email: { $regex: search, $options: "i" } }] }
    : {};

  const users = await usersCollection().find(query).sort({ createdAt: -1 }).toArray();
  res.send(users);
};

// PATCH /users/admin/:id
export const makeAdmin = async (req, res) => {
  const id = req.params.id;
  const result = await usersCollection().updateOne(
    { _id: new ObjectId(id) },
    { $set: { role: "admin" } }
  );
  res.send(result);
};

// PATCH /users/vendor/:id
export const makeVendor = async (req, res) => {
  const id = req.params.id;
  const result = await usersCollection().updateOne(
    { _id: new ObjectId(id) },
    { $set: { role: "vendor", fraud: false } }
  );
  res.send(result);
};

// PATCH /users/fraud/:id — flags a vendor as fraud, hides all of their tickets
export const markFraud = async (req, res) => {
  const id = req.params.id;
  const user = await usersCollection().findOne({ _id: new ObjectId(id) });

  if (!user || user.role !== "vendor") {
    return res.status(400).send({ message: "Only vendors can be marked as fraud" });
  }

  await usersCollection().updateOne({ _id: new ObjectId(id) }, { $set: { fraud: true } });

  // Hide every ticket this vendor has listed
  await ticketsCollection().updateMany(
    { vendorEmail: user.email },
    { $set: { verificationStatus: "rejected", advertised: false } }
  );

  res.send({ message: "Vendor marked as fraud, tickets hidden" });
};
