import mongoose, { Schema, Document } from "mongoose";
export interface ILabResult extends Document {
  order: mongoose.Types.ObjectId;
  test: mongoose.Types.ObjectId;
  patient: mongoose.Types.ObjectId;
  result: string;
  status: "Normal" | "Abnormal" | "Critical";
  remarks?: string;
  reportUrl?: string;
  verifiedBy?: mongoose.Types.ObjectId;
}
const LabResultSchema = new Schema(
  {
    order: {
      type: Schema.Types.ObjectId,
      ref: "LabOrder",
      required: true,
    },
    test: { type: Schema.Types.ObjectId, ref: "LabTest", required: true },
    patient: { type: Schema.Types.ObjectId, ref: "Patient", required: true },
    result: { type: String, required: true },
    status: {
      type: String,
      enum: ["Normal", "Abnormal", "Critical"],
      required: true,
    },
    remarks: String,
    reportUrl: String,
    verifiedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);
export default mongoose.model<ILabResult>(
  "LabResult",
  LabResultSchema,
  "labResults"
);
