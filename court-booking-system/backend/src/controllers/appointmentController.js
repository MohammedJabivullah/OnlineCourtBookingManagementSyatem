import Appointment from "../models/Appointment.js"
import User from "../models/User.js"
import { sendEmail, sendSMS } from "../services/notify.js"
import { timeSlots } from "../utils/slots.js"

export async function listAppointments(req, res, next) {
  try {
    const list = await Appointment.find().sort({ createdAt: -1 })
    res.json(list)
  } catch (e) { next(e) }
}

export async function createAppointment(req, res, next) {
  try {
    const { clientId, lawyerId, date, time, description } = req.body
    const exists = await Appointment.findOne({ lawyerId, date, time })
    if (exists) return res.status(409).json({ error: "Appointment slot not available" })
    const a = await Appointment.create({ clientId, lawyerId, date, time, description, status: "pending" })
    // Notify lawyer of new appointment request
    const lawyer = await User.findById(lawyerId)
    if (lawyer?.email) sendEmail(lawyer.email, 'New Appointment Request', `Requested ${date} ${time} — ${description}`)
    res.status(201).json(a)
  } catch (e) { next(e) }
}

export async function approveAppointment(req, res, next) {
  try {
    const { id } = req.params
    const updated = await Appointment.findByIdAndUpdate(id, { status: "confirmed" }, { new: true })
    if (!updated) return res.status(404).json({ error: "Not found" })
    // Notify client and lawyer confirmation
    const [lawyer, client] = await Promise.all([
      User.findById(updated.lawyerId),
      User.findById(updated.clientId),
    ])
    const subject = 'Appointment Confirmed'
    const msg = `Reminder: Your appointment is scheduled on ${updated.date}, ${updated.time}.`
    if (lawyer?.email) sendEmail(lawyer.email, subject, msg)
    if (client?.email) sendEmail(client.email, subject, msg)
    if (lawyer?.phone) sendSMS(lawyer.phone, msg)
    if (client?.phone) sendSMS(client.phone, msg)
    res.json(updated)
  } catch (e) { next(e) }
}

export async function removeAppointment(req, res, next) {
  try {
    const { id } = req.params
    const del = await Appointment.findByIdAndDelete(id)
    if (!del) return res.status(404).json({ error: "Not found" })
    res.json({ ok: true })
  } catch (e) { next(e) }
}

// GET /api/appointments/availability?lawyerId=...&date=YYYY-MM-DD
export async function getAppointmentAvailability(req, res, next) {
  try {
    const { lawyerId, date } = req.query
    if (!lawyerId || !date) return res.status(400).json({ error: "lawyerId and date are required" })
    const taken = new Set((await Appointment.find({ lawyerId, date })).map((a) => a.time))
    const slots = timeSlots.map((t) => ({ time: t, available: !taken.has(t) }))
    res.json({ lawyerId, date, slots })
  } catch (e) { next(e) }
}

export async function reportAppointments(req, res, next) {
  try {
    const { lawyerId, clientId, from, to, format } = req.query
    const q = {}
    if (lawyerId) q.lawyerId = lawyerId
    if (clientId) q.clientId = clientId
    if (from || to) {
      q.date = {}
      if (from) q.date.$gte = from
      if (to) q.date.$lte = to
    }
    const rows = await Appointment.find(q).sort({ date: 1, time: 1 })
    if (format === 'csv') {
      const header = 'date,time,description,status,lawyerId,clientId\n'
      const body = rows.map(r => `${r.date},${r.time},"${(r.description||'').replaceAll('"','""')}",${r.status},${r.lawyerId},${r.clientId}`).join('\n')
      res.setHeader('Content-Type', 'text/csv')
      res.setHeader('Content-Disposition', 'attachment; filename="appointments.csv"')
      return res.send(header + body)
    }
    res.json(rows)
  } catch (e) { next(e) }
}


