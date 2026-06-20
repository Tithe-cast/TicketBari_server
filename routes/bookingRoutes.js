import express from "express";
import verifyToken from "../middleware/verifyToken.js";
import verifyVendor from "../middleware/verifyVendor.js";
import {
  createBooking,
  getUserBookings,
  getVendorBookings,
  getBookingById,
  acceptBooking,
  rejectBooking,
  cancelBooking,
} from "../controllers/bookingController.js";

const router = express.Router();

router.post("/bookings", verifyToken, createBooking);
router.get("/bookings/user/:email", verifyToken, getUserBookings);
router.get("/bookings/vendor/:email", verifyToken, verifyVendor, getVendorBookings);
router.get("/bookings/:id", verifyToken, getBookingById);
router.patch("/bookings/accept/:id", verifyToken, verifyVendor, acceptBooking);
router.patch("/bookings/reject/:id", verifyToken, verifyVendor, rejectBooking);
router.delete("/bookings/:id", verifyToken, cancelBooking);

export default router;
