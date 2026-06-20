import express from "express";
import verifyToken from "../middleware/verifyToken.js";
import verifyAdmin from "../middleware/verifyAdmin.js";
import {
  issueJWT,
  syncUser,
  getUserRole,
  getSingleUser,
  getAllUsers,
  makeAdmin,
  makeVendor,
  markFraud,
} from "../controllers/userController.js";

const router = express.Router();

router.post("/jwt", issueJWT);
router.post("/users", syncUser);
router.get("/users/role/:email", verifyToken, getUserRole);
router.get("/users/:email", verifyToken, getSingleUser);
router.get("/users", verifyToken, verifyAdmin, getAllUsers);
router.patch("/users/admin/:id", verifyToken, verifyAdmin, makeAdmin);
router.patch("/users/vendor/:id", verifyToken, verifyAdmin, makeVendor);
router.patch("/users/fraud/:id", verifyToken, verifyAdmin, markFraud);

export default router;
