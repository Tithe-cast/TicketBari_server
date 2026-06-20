import express from "express";
import verifyToken from "../middleware/verifyToken.js";
import { createPaymentIntent, recordPayment, getUserPayments } from "../controllers/paymentController.js";

const router = express.Router();

router.post("/create-payment-intent", verifyToken, createPaymentIntent);
router.post("/payments", verifyToken, recordPayment);
router.get("/payments/user/:email", verifyToken, getUserPayments);

export default router;
