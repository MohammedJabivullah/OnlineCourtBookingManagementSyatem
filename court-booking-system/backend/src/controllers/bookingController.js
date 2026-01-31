import Booking from "../models/Booking.js"
import User from "../models/User.js"
import { sendEmail, sendSMS } from "../services/notify.js"

export async function listBookings(req, res, next) {
  try {
    const list = await Booking.find().sort({ createdAt: -1 })
    res.json(list)
  } catch (e) { next(e) }
}

export async function createBooking(req, res, next) {
  try {
    const { lawyerId, clientId, courtroom, date, time, caseTitle } = req.body
    const exists = await Booking.findOne({ courtroom, date, time })
    if (exists) return res.status(409).json({ error: "Slot already booked" })
    const b = await Booking.create({ lawyerId, clientId, courtroom, date, time, caseTitle, status: "pending" })
    // Notify admin for approval
    const admin = await User.findOne({ role: 'admin' })
    if (admin?.email) sendEmail(admin.email, 'New Booking Pending', `Booking requested: ${date} ${time} ${courtroom}`)
    res.status(201).json(b)
  } catch (e) { next(e) }
}

export async function approveBooking(req, res, next) {
  try {
    const { id } = req.params
    const updated = await Booking.findByIdAndUpdate(id, { status: "confirmed" }, { new: true })
    if (!updated) return res.status(404).json({ error: "Not found" })
    // Notify lawyer and client
    const [lawyer, client] = await Promise.all([
      User.findById(updated.lawyerId),
      User.findById(updated.clientId),
    ])
    const subject = 'Booking Confirmed'
    const msg = `Reminder: Your hearing is scheduled on ${updated.date}, ${updated.time}, ${updated.courtroom}.`
    if (lawyer?.email) sendEmail(lawyer.email, subject, msg)
    if (client?.email) sendEmail(client.email, subject, msg)
    if (lawyer?.phone) sendSMS(lawyer.phone, msg)
    if (client?.phone) sendSMS(client.phone, msg)
    res.json(updated)
  } catch (e) { next(e) }
}

export async function removeBooking(req, res, next) {
  try {
    const { id } = req.params
    const del = await Booking.findByIdAndDelete(id)
    if (!del) return res.status(404).json({ error: "Not found" })
    res.json({ ok: true })
  } catch (e) { next(e) }
}

export async function reportBookings(req, res, next) {
  try {
    const { lawyerId, from, to, format } = req.query
    const q = {}
    if (lawyerId) q.lawyerId = lawyerId
    if (from || to) {
      q.date = {}
      if (from) q.date.$gte = from
      if (to) q.date.$lte = to
    }
    const rows = await Booking.find(q).sort({ date: 1, time: 1 })
    if (format === 'csv') {
      const header = 'date,time,courtroom,caseTitle,status,lawyerId,clientId\n'
      const body = rows.map(r => `${r.date},${r.time},${r.courtroom},"${(r.caseTitle||'').replaceAll('"','""')}",${r.status},${r.lawyerId},${r.clientId}`).join('\n')
      res.setHeader('Content-Type', 'text/csv')
      res.setHeader('Content-Disposition', 'attachment; filename="bookings.csv"')
      return res.send(header + body)
    }
    res.json(rows)
  } catch (e) { next(e) }
}


