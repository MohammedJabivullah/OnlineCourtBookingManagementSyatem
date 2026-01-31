import mongoose from "mongoose"

const AppointmentSchema = new mongoose.Schema(
  {
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    lawyerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: String, enum: ["pending", "confirmed"], default: "pending" },
  },
  { timestamps: true }
)

AppointmentSchema.index({ lawyerId: 1, date: 1, time: 1 }, { unique: true })

export default mongoose.model("Appointment", AppointmentSchema)


