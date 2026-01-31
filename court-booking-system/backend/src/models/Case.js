import mongoose from "mongoose"

const CaseSchema = new mongoose.Schema(
  {
    caseId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    court: { type: String, required: true },
    date: { type: String, required: true },
    judge: { type: String },
    lawyerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    clientIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
)

export default mongoose.model("Case", CaseSchema)


