// TicketBari uses the native MongoDB driver, so "models" here are simple
// document factories + constants rather than Mongoose schemas.

export const ROLES = {
  USER: "user",
  VENDOR: "vendor",
  ADMIN: "admin",
};

/**
 * Shape of a user document.
 * BetterAuth creates the core `user` collection (name, email, image, etc).
 * We extend it with our own fields via `additionalFields` in lib/auth.js,
 * and this factory is used when we need to manually upsert/seed a user
 * (e.g. for the very first admin account).
 */
export const createUserDoc = ({ name, email, photoURL = "", role = ROLES.USER }) => ({
  name,
  email,
  photoURL,
  role,
  fraud: false,
  createdAt: new Date(),
});
