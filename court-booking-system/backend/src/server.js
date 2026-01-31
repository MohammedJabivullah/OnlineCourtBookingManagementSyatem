import "dotenv/config"
import express from "express"
import cors from "cors"
import morgan from "morgan"
import mongoose from "mongoose"
import router from "./routes/index.js"
import bcrypt from "bcryptjs"
import User from "./models/User.js"

const app = express()
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(",") || true, credentials: true }))
app.use(express.json())
app.use(morgan("dev"))

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/court_booking"
mongoose.connect(MONGO_URI).then(() => console.log("Mongo connected")).catch((e) => {
  console.error("Mongo connection error", e)
  process.exit(1)
})

app.use("/api", router)

app.use((err, req, res, next) => {
  console.error(err)
  res.status(err.status || 500).json({ error: err.message || "Server error" })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, async () => {
  console.log(`API listening on :${PORT}`)
  // Ensure default admin exists
  const adminUsername = process.env.ADMIN_USERNAME || "admin"
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123"
  const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com"
  const existing = await User.findOne({ username: adminUsername })
  if (!existing) {
    const passwordHash = await bcrypt.hash(adminPassword, 10)
    await User.create({ name: "System Administrator", username: adminUsername, passwordHash, role: "admin", email: adminEmail })
    console.log("Seeded default admin user")
  }
})


