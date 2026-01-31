import Case from "../models/Case.js"
import Appointment from "../models/Appointment.js"
import Booking from "../models/Booking.js"

export async function listCases(req, res, next) {
  try {
    const list = await Case.find().sort({ createdAt: -1 })
    res.json(list)
  } catch (e) { next(e) }
}

export async function createCase(req, res, next) {
  try {
    const { caseId, title, court, date, judge, lawyerId, clientIds } = req.body
    const exists = await Case.findOne({ caseId })
    if (exists) return res.status(409).json({ error: "Case ID already exists" })
    const c = await Case.create({ caseId, title, court, date, judge, lawyerId, clientIds: clientIds || [] })
    // Automatically add to calendar by creating a booking placeholder (no courtroom yet)
    await Booking.create({ lawyerId, clientId: clientIds?.[0], courtroom: court, date, time: "11:00 AM", caseTitle: title, status: "confirmed" }).catch(() => {})
    // Notify all linked clients via pending appointments as alerts
    if (Array.isArray(clientIds)) {
      await Promise.all(clientIds.map((cid) => Appointment.create({ clientId: cid, lawyerId, date, time: "10:00 AM", description: `Case ${title} scheduled`, status: "pending" }).catch(() => {})))
    }
    res.status(201).json(c)
  } catch (e) { next(e) }
}


