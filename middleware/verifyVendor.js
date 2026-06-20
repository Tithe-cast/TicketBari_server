import { usersCollection } from "../config/db.js";

// Must be used AFTER verifyToken so req.decoded.email is available.
const verifyVendor = async (req, res, next) => {
  const email = req.decoded.email;
  const user = await usersCollection().findOne({ email });

  if (!user || user.role !== "vendor") {
    return res.status(403).send({ message: "Forbidden access: vendors only" });
  }

  if (user.fraud) {
    return res.status(403).send({ message: "Account flagged: vendor access revoked" });
  }

  next();
};

export default verifyVendor;
