import { ticketsCollection, bookingsCollection, paymentsCollection, usersCollection } from "../config/db.js";

// GET /vendor-stats/:email — Vendor "Revenue Overview" page
export const getVendorStats = async (req, res) => {
  const email = req.params.email;

  const totalTicketsAdded = await ticketsCollection().countDocuments({ vendorEmail: email });

  const paidBookings = await bookingsCollection()
    .find({ vendorEmail: email, status: "paid" })
    .toArray();

  const totalTicketsSold = paidBookings.reduce((sum, b) => sum + b.bookingQuantity, 0);
  const totalRevenue = paidBookings.reduce((sum, b) => sum + b.totalPrice, 0);

  // Revenue grouped by month for the chart
  const revenueByMonth = {};
  paidBookings.forEach((b) => {
    const month = new Date(b.createdAt).toLocaleString("en-US", { month: "short", year: "numeric" });
    revenueByMonth[month] = (revenueByMonth[month] || 0) + b.totalPrice;
  });

  const chartData = Object.entries(revenueByMonth).map(([month, revenue]) => ({ month, revenue }));

  res.send({ totalTicketsAdded, totalTicketsSold, totalRevenue, chartData });
};

// GET /admin-stats — small summary for the Admin dashboard
export const getAdminStats = async (req, res) => {
  const totalUsers = await usersCollection().countDocuments();
  const totalTickets = await ticketsCollection().countDocuments();
  const totalBookings = await bookingsCollection().countDocuments();

  const payments = await paymentsCollection().find().toArray();
  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);

  res.send({ totalUsers, totalTickets, totalBookings, totalRevenue });
};
