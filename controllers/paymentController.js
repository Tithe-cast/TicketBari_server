import Stripe from "stripe";
import { ObjectId } from "mongodb";
import { bookingsCollection, paymentsCollection, ticketsCollection } from "../config/db.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// POST /create-payment-intent — called when the "Pay Now" modal opens
export const createPaymentIntent = async (req, res) => {
  const { totalPrice } = req.body;
  const amount = Math.round(Number(totalPrice) * 100); // Stripe expects cents

  if (!amount || amount < 1) {
    return res.status(400).send({ message: "Invalid amount" });
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: "usd",
    payment_method_types: ["card"],
  });

  res.send({ clientSecret: paymentIntent.client_secret });
};

// POST /payments — called after Stripe confirms the card payment succeeded
export const recordPayment = async (req, res) => {
  const { bookingId, transactionId, amount, userEmail, ticketTitle } = req.body;

  const booking = await bookingsCollection().findOne({ _id: new ObjectId(bookingId) });
  if (!booking) return res.status(404).send({ message: "Booking not found" });

  if (new Date(booking.departureDateTime) < new Date()) {
    return res.status(400).send({ message: "Cannot pay for a departed ticket" });
  }

  // 1. Mark booking as paid
  await bookingsCollection().updateOne(
    { _id: new ObjectId(bookingId) },
    { $set: { status: "paid" } }
  );

  // 2. Reduce ticket stock by the booked quantity
  await ticketsCollection().updateOne(
    { _id: new ObjectId(booking.ticketId) },
    { $inc: { quantity: -booking.bookingQuantity } }
  );

  // 3. Save the transaction record
  const payment = {
    bookingId,
    transactionId,
    amount: Number(amount),
    userEmail,
    ticketTitle,
    paymentDate: new Date(),
  };
  const result = await paymentsCollection().insertOne(payment);

  res.send({ insertedId: result.insertedId, message: "Payment recorded" });
};

// GET /payments/user/:email — "Transaction History" table
export const getUserPayments = async (req, res) => {
  const email = req.params.email;
  const payments = await paymentsCollection().find({ userEmail: email }).sort({ paymentDate: -1 }).toArray();
  res.send(payments);
};
