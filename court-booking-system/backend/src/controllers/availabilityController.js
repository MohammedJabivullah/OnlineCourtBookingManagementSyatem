import Booking from "../models/Booking.js"
import Courtroom from "../models/Courtroom.js"
import { timeSlots } from "../utils/slots.js"

// GET /api/availability?date=2025-08-25
export async function getAvailability(req, res, next) {
  try {
    const date = req.query.date
    if (!date) return res.status(400).json({ error: "date is required (YYYY-MM-DD)" })
    const rooms = await Courtroom.find({ isActive: true }).sort({ name: 1 })
    const bookings = await Booking.find({ date })

    const result = rooms.map((room) => {
      const taken = new Set(
        bookings.filter((b) => b.courtroom === room.name).map((b) => b.time)
      )
      const slots = timeSlots.map((slot) => ({ time: slot, available: !taken.has(slot) }))
      return { courtroom: room.name, slots }
    })

    res.json({ date, availability: result })
  } catch (e) { next(e) }
}


