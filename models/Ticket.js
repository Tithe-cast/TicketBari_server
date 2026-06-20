export const VERIFICATION_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
};

export const TRANSPORT_TYPES = ["Bus", "Train", "Launch", "Plane"];

/**
 * @typedef Ticket
 * @property {string} title
 * @property {string} image
 * @property {string} from
 * @property {string} to
 * @property {string} transportType - Bus | Train | Launch | Plane
 * @property {number} price - per unit
 * @property {number} quantity
 * @property {string} departureDateTime - ISO string
 * @property {string[]} perks - e.g. ["AC", "Breakfast"]
 * @property {string} vendorName
 * @property {string} vendorEmail
 * @property {string} verificationStatus - pending | approved | rejected
 * @property {boolean} advertised
 * @property {Date} createdAt
 */
export const createTicketDoc = (data) => ({
  title: data.title,
  image: data.image,
  from: data.from,
  to: data.to,
  transportType: data.transportType,
  price: Number(data.price),
  quantity: Number(data.quantity),
  departureDateTime: data.departureDateTime,
  perks: data.perks || [],
  vendorName: data.vendorName,
  vendorEmail: data.vendorEmail,
  verificationStatus: VERIFICATION_STATUS.PENDING,
  advertised: false,
  createdAt: new Date(),
});
