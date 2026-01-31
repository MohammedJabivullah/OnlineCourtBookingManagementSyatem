import mongoose from "mongoose"

const BookingSchema = new mongoose.Schema(
  {
    lawyerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    courtroom: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    caseTitle: { type: String, required: true },
    status: { type: String, enum: ["pending", "confirmed"], default: "pending" },
  },
  { timestamps: true }
)

BookingSchema.index({ courtroom: 1, date: 1, time: 1 }, { unique: true })

export default mongoose.model("Booking", BookingSchema)


