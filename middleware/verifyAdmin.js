import { usersCollection } from "../config/db.js";

// Must be used AFTER verifyToken so req.decoded.email is available.
const verifyAdmin = async (req, res, next) => {
  const email = req.decoded.email;
  const user = await usersCollection().findOne({ email });

  if (!user || user.role !== "admin") {
    return res.status(403).send({ message: "Forbidden access: admins only" });
  }

  next();
};

export default verifyAdmin;
