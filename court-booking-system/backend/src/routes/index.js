import { Router } from "express"
import { signup, login, listUsers, listLawyersPublic, listClients } from "../controllers/userController.js"
import { listCourtrooms, createCourtroom } from "../controllers/courtroomController.js"
import { listBookings, createBooking, approveBooking, removeBooking, reportBookings } from "../controllers/bookingController.js"
import { listAppointments, createAppointment, approveAppointment, removeAppointment, getAppointmentAvailability, reportAppointments } from "../controllers/appointmentController.js"
import { listCases, createCase } from "../controllers/caseController.js"
import { authenticate, authorizeRoles } from "../middleware/auth.js"
import { getAvailability } from "../controllers/availabilityController.js"

const router = Router()

// auth / users
router.post("/auth/signup", signup)
router.post("/auth/login", login)
router.get("/users", authenticate, authorizeRoles("admin"), listUsers)
router.get("/lawyers", listLawyersPublic)
router.get("/clients", authenticate, authorizeRoles("admin", "lawyer"), listClients)

// courtrooms
router.get("/courtrooms", listCourtrooms)
router.post("/courtrooms", authenticate, authorizeRoles("admin"), createCourtroom)

// availability (public read)
router.get("/availability", getAvailability)

// bookings
router.get("/bookings", authenticate, authorizeRoles("admin", "lawyer", "client"), listBookings)
router.post("/bookings", authenticate, authorizeRoles("lawyer"), createBooking)
router.post("/bookings/:id/approve", authenticate, authorizeRoles("admin"), approveBooking)
router.delete("/bookings/:id", authenticate, authorizeRoles("admin"), removeBooking)
router.get("/reports/bookings", authenticate, authorizeRoles("admin", "lawyer"), reportBookings)

// appointments
router.get("/appointments", authenticate, authorizeRoles("admin", "lawyer", "client"), listAppointments)
router.post("/appointments", authenticate, authorizeRoles("client"), createAppointment)
router.post("/appointments/:id/approve", authenticate, authorizeRoles("lawyer"), approveAppointment)
router.delete("/appointments/:id", authenticate, authorizeRoles("lawyer", "admin"), removeAppointment)
router.get("/appointments/availability", getAppointmentAvailability)
router.get("/reports/appointments", authenticate, authorizeRoles("admin", "lawyer"), reportAppointments)

// cases
router.get("/cases", authenticate, authorizeRoles("admin", "lawyer"), listCases)
router.post("/cases", authenticate, authorizeRoles("lawyer"), createCase)

export default router


