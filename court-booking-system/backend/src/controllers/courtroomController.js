import Courtroom from "../models/Courtroom.js"

export async function listCourtrooms(req, res, next) {
  try {
    const list = await Courtroom.find({ isActive: true }).sort({ name: 1 })
    res.json(list)
  } catch (e) { next(e) }
}

export async function createCourtroom(req, res, next) {
  try {
    const { name } = req.body
    const exists = await Courtroom.findOne({ name })
    if (exists) return res.status(409).json({ error: "Courtroom exists" })
    const room = await Courtroom.create({ name })
    res.status(201).json(room)
  } catch (e) { next(e) }
}


