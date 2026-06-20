import express from "express";
import verifyToken from "../middleware/verifyToken.js";
import verifyAdmin from "../middleware/verifyAdmin.js";
import verifyVendor from "../middleware/verifyVendor.js";
import {
  addTicket,
  getApprovedTickets,
  getLatestTickets,
  getAdvertisedTickets,
  getVendorTickets,
  getAllTicketsForAdmin,
  getTicketById,
  updateTicket,
  deleteTicket,
  approveTicket,
  rejectTicket,
  toggleAdvertise,
} from "../controllers/ticketController.js";

const router = express.Router();

// Public
router.get("/tickets", getApprovedTickets);
router.get("/tickets/latest", getLatestTickets);
router.get("/tickets/advertised", getAdvertisedTickets);

// Vendor
router.post("/tickets", verifyToken, verifyVendor, addTicket);
router.get("/tickets/vendor/:email", verifyToken, verifyVendor, getVendorTickets);
router.patch("/tickets/:id", verifyToken, verifyVendor, updateTicket);
router.delete("/tickets/:id", verifyToken, verifyVendor, deleteTicket);

// Admin
router.get("/tickets/manage", verifyToken, verifyAdmin, getAllTicketsForAdmin);
router.patch("/tickets/approve/:id", verifyToken, verifyAdmin, approveTicket);
router.patch("/tickets/reject/:id", verifyToken, verifyAdmin, rejectTicket);
router.patch("/tickets/advertise/:id", verifyToken, verifyAdmin, toggleAdvertise);

// Protected detail view (any logged-in role) — keep AFTER the specific
// string routes above so "/tickets/latest" etc. don't get swallowed by ":id"
router.get("/tickets/:id", verifyToken, getTicketById);

export default router;
