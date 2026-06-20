import { ObjectId } from "mongodb";
import { bookingsCollection, ticketsCollection } from "../config/db.js";
import { createBookingDoc } from "../models/Booking.js";

// POST /bookings — user books a ticket from the Ticket Details modal
export const createBooking = async (req, res) => {
  const { ticketId, bookingQuantity } = req.body;

  const ticket = await ticketsCollection().findOne({ _id: new ObjectId(ticketId) });
  if (!ticket) return res.status(404).send({ message: "Ticket not found" });

  if (new Date(ticket.departureDateTime) < new Date()) {
    return res.status(400).send({ message: "This ticket has already departed" });
  }

  if (Number(bookingQuantity) > ticket.quantity) {
    return res.status(400).send({ message: "Booking quantity exceeds available tickets" });
  }

  const booking = createBookingDoc({
    ticketId,
    ticketTitle: ticket.title,
    ticketImage: ticket.image,
    unitPrice: ticket.price,
    from: ticket.from,
    to: ticket.to,
    departureDateTime: ticket.departureDateTime,
    userName: req.body.userName,
    userEmail: req.body.userEmail,
    vendorEmail: ticket.vendorEmail,
    bookingQuantity,
  });

  const result = await bookingsCollection().insertOne(booking);
  res.send(result);
};

// GET /bookings/user/:email — "My Booked Tickets"
export const getUserBookings = async (req, res) => {
  const email = req.params.email;
  const bookings = await bookingsCollection().find({ userEmail: email }).sort({ createdAt: -1 }).toArray();
  res.send(bookings);
};

// GET /bookings/vendor/:email — "Requested Bookings" table
export const getVendorBookings = async (req, res) => {
  const email = req.params.email;
  const bookings = await bookingsCollection().find({ vendorEmail: email }).sort({ createdAt: -1 }).toArray();
  res.send(bookings);
};

// GET /bookings/:id — single booking (used on the Payment page)
export const getBookingById = async (req, res) => {
  const id = req.params.id;
  const booking = await bookingsCollection().findOne({ _id: new ObjectId(id) });
  if (!booking) return res.status(404).send({ message: "Booking not found" });
  res.send(booking);
};

// PATCH /bookings/accept/:id — vendor accepts a booking request
export const acceptBooking = async (req, res) => {
  const id = req.params.id;
  const result = await bookingsCollection().updateOne(
    { _id: new ObjectId(id) },
    { $set: { status: "accepted" } }
  );
  res.send(result);
};

// PATCH /bookings/reject/:id — vendor rejects a booking request
export const rejectBooking = async (req, res) => {
  const id = req.params.id;
  const result = await bookingsCollection().updateOne(
    { _id: new ObjectId(id) },
    { $set: { status: "rejected" } }
  );
  res.send(result);
};

// DELETE /bookings/:id — optional requirement: user cancels before vendor accepts
export const cancelBooking = async (req, res) => {
  const id = req.params.id;
  const booking = await bookingsCollection().findOne({ _id: new ObjectId(id) });

  if (!booking) return res.status(404).send({ message: "Booking not found" });
  if (booking.status !== "pending") {
    return res.status(403).send({ message: "Only pending bookings can be cancelled" });
  }

  const result = await bookingsCollection().deleteOne({ _id: new ObjectId(id) });
  res.send(result);
};
