import { ObjectId } from "mongodb";
import { ticketsCollection } from "../config/db.js";
import { createTicketDoc } from "../models/Ticket.js";

// POST /tickets — vendor adds a new ticket (verificationStatus: pending)
export const addTicket = async (req, res) => {
  const ticket = createTicketDoc(req.body);
  const result = await ticketsCollection().insertOne(ticket);
  res.send(result);
};

// GET /tickets — public "All Tickets" page
// Supports: search (from/to), filter (transportType), sort (price), pagination
export const getApprovedTickets = async (req, res) => {
  const { search, transportType, sort, page = 0, limit = 9 } = req.query;

  const query = { verificationStatus: "approved" };

  if (search) {
    query.$or = [
      { from: { $regex: search, $options: "i" } },
      { to: { $regex: search, $options: "i" } },
    ];
  }

  if (transportType && transportType !== "all") {
    query.transportType = transportType;
  }

  const sortOption = sort === "asc" ? 1 : sort === "desc" ? -1 : null;

  const cursor = ticketsCollection().find(query);
  const total = await ticketsCollection().countDocuments(query);

  if (sortOption) cursor.sort({ price: sortOption });
  else cursor.sort({ createdAt: -1 });

  const tickets = await cursor
    .skip(Number(page) * Number(limit))
    .limit(Number(limit))
    .toArray();

  res.send({ tickets, total });
};

// GET /tickets/latest — homepage "Latest Tickets" section
export const getLatestTickets = async (req, res) => {
  const tickets = await ticketsCollection()
    .find({ verificationStatus: "approved" })
    .sort({ createdAt: -1 })
    .limit(8)
    .toArray();
  res.send(tickets);
};

// GET /tickets/advertised — homepage "Advertisement" section (admin-picked, max 6)
export const getAdvertisedTickets = async (req, res) => {
  const tickets = await ticketsCollection()
    .find({ verificationStatus: "approved", advertised: true })
    .limit(6)
    .toArray();
  res.send(tickets);
};

// GET /tickets/vendor/:email — vendor's "My Added Tickets"
export const getVendorTickets = async (req, res) => {
  const email = req.params.email;
  const tickets = await ticketsCollection()
    .find({ vendorEmail: email })
    .sort({ createdAt: -1 })
    .toArray();
  res.send(tickets);
};

// GET /tickets/manage — admin "Manage Tickets" table (every ticket, any status)
export const getAllTicketsForAdmin = async (req, res) => {
  const tickets = await ticketsCollection().find().sort({ createdAt: -1 }).toArray();
  res.send(tickets);
};

// GET /tickets/:id — Ticket Details page (protected route)
export const getTicketById = async (req, res) => {
  const id = req.params.id;
  const ticket = await ticketsCollection().findOne({ _id: new ObjectId(id) });
  if (!ticket) return res.status(404).send({ message: "Ticket not found" });
  res.send(ticket);
};

// PATCH /tickets/:id — vendor updates their own ticket
export const updateTicket = async (req, res) => {
  const id = req.params.id;
  const updatedData = req.body;

  const ticket = await ticketsCollection().findOne({ _id: new ObjectId(id) });
  if (ticket?.verificationStatus === "rejected") {
    return res.status(403).send({ message: "Rejected tickets cannot be updated" });
  }

  const result = await ticketsCollection().updateOne(
    { _id: new ObjectId(id) },
    { $set: updatedData }
  );
  res.send(result);
};

// DELETE /tickets/:id — vendor deletes their own ticket
export const deleteTicket = async (req, res) => {
  const id = req.params.id;

  const ticket = await ticketsCollection().findOne({ _id: new ObjectId(id) });
  if (ticket?.verificationStatus === "rejected") {
    return res.status(403).send({ message: "Rejected tickets cannot be deleted" });
  }

  const result = await ticketsCollection().deleteOne({ _id: new ObjectId(id) });
  res.send(result);
};

// PATCH /tickets/approve/:id — admin
export const approveTicket = async (req, res) => {
  const id = req.params.id;
  const result = await ticketsCollection().updateOne(
    { _id: new ObjectId(id) },
    { $set: { verificationStatus: "approved" } }
  );
  res.send(result);
};

// PATCH /tickets/reject/:id — admin
export const rejectTicket = async (req, res) => {
  const id = req.params.id;
  const result = await ticketsCollection().updateOne(
    { _id: new ObjectId(id) },
    { $set: { verificationStatus: "rejected", advertised: false } }
  );
  res.send(result);
};

// PATCH /tickets/advertise/:id — admin toggles advertise, capped at 6 active
export const toggleAdvertise = async (req, res) => {
  const id = req.params.id;
  const ticket = await ticketsCollection().findOne({ _id: new ObjectId(id) });

  if (!ticket) return res.status(404).send({ message: "Ticket not found" });

  if (!ticket.advertised) {
    const advertisedCount = await ticketsCollection().countDocuments({ advertised: true });
    if (advertisedCount >= 6) {
      return res.status(400).send({ message: "You can only advertise up to 6 tickets at a time" });
    }
  }

  const result = await ticketsCollection().updateOne(
    { _id: new ObjectId(id) },
    { $set: { advertised: !ticket.advertised } }
  );
  res.send(result);
};

// Internal helper (used by paymentController) — reduces stock after a paid booking
export const reduceTicketQuantity = async (ticketId, quantity) => {
  await ticketsCollection().updateOne(
    { _id: new ObjectId(ticketId) },
    { $inc: { quantity: -Number(quantity) } }
  );
};
