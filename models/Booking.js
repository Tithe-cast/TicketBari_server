export const BOOKING_STATUS = {
  PENDING: "pending",
  ACCEPTED: "accepted",
  REJECTED: "rejected",
  PAID: "paid",
};

/**
 * @typedef Booking
 * @property {string} ticketId
 * @property {string} ticketTitle
 * @property {string} ticketImage
 * @property {number} unitPrice
 * @property {string} from
 * @property {string} to
 * @property {string} departureDateTime
 * @property {string} userName
 * @property {string} userEmail
 * @property {string} vendorEmail
 * @property {number} bookingQuantity
 * @property {number} totalPrice
 * @property {string} status - pending | accepted | rejected | paid
 * @property {Date} createdAt
 */
export const createBookingDoc = (data) => ({
  ticketId: data.ticketId,
  ticketTitle: data.ticketTitle,
  ticketImage: data.ticketImage,
  unitPrice: Number(data.unitPrice),
  from: data.from,
  to: data.to,
  departureDateTime: data.departureDateTime,
  userName: data.userName,
  userEmail: data.userEmail,
  vendorEmail: data.vendorEmail,
  bookingQuantity: Number(data.bookingQuantity),
  totalPrice: Number(data.unitPrice) * Number(data.bookingQuantity),
  status: BOOKING_STATUS.PENDING,
  createdAt: new Date(),
});
