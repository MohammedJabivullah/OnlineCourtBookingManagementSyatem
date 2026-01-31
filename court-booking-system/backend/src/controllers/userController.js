import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import User from "../models/User.js"

export async function signup(req, res, next) {
  try {
    const { name, username, password, role, email, phone, specialization } = req.body
    const exists = await User.findOne({ username })
    if (exists) return res.status(409).json({ error: "Username exists" })
    const passwordHash = await bcrypt.hash(password, 10)
    const user = await User.create({ name, username, passwordHash, role, email, phone, specialization })
    res.status(201).json({ id: user._id })
  } catch (e) { next(e) }
}

export async function login(req, res, next) {
  try {
    const { username, password } = req.body
    const user = await User.findOne({ username })
    if (!user) return res.status(401).json({ error: "Invalid credentials" })
    const ok = await bcrypt.compare(password, user.passwordHash)
    if (!ok) return res.status(401).json({ error: "Invalid credentials" })
    const token = jwt.sign({ sub: user._id, role: user.role }, process.env.JWT_SECRET || "devsecret", { expiresIn: "7d" })
    res.json({ token, user: { id: user._id, name: user.name, role: user.role } })
  } catch (e) { next(e) }
}

export async function listUsers(req, res, next) {
  try {
    const users = await User.find().select("name username role specialization email phone")
    res.json(users)
  } catch (e) { next(e) }
}

export async function listLawyersPublic(req, res, next) {
  try {
    const lawyers = await User.find({ role: 'lawyer' }).select('name username role specialization email phone')
    res.json(lawyers)
  } catch (e) { next(e) }
}

export async function listClients(req, res, next) {
  try {
    const clients = await User.find({ role: 'client' }).select('name username role email phone')
    res.json(clients)
  } catch (e) { next(e) }
}


