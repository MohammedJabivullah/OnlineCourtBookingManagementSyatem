import mongoose from "mongoose"

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["admin", "lawyer", "client"], required: true },
    specialization: { type: String },
    email: { type: String, index: true },
    phone: { type: String },
  },
  { timestamps: true }
)

export default mongoose.model("User", UserSchema)


