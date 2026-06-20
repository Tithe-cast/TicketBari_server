import jwt from "jsonwebtoken";

/**
 * Protects API routes with our own JWT (separate from BetterAuth's session
 * cookie). The client requests this token once after BetterAuth login
 * (see routes/userRoutes.js -> POST /jwt) and sends it as:
 *   Authorization: Bearer <token>
 * on every request to our resource API.
 */
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).send({ message: "Unauthorized access" });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, decoded) => {
    if (error) {
      return res.status(401).send({ message: "Unauthorized access" });
    }
    req.decoded = decoded;
    next();
  });
};

export default verifyToken;
