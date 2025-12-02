
import mongoose, { Schema, Document } from "mongoose";

export interface ILabResult extends Document {
  orderId: mongoose.Types.ObjectId;
  testId: mongoose.Types.ObjectId;
  patientId: mongoose.Types.ObjectId;
  resultValue: string;
  referenceRange?: string;
  status: "Normal" | "Abnormal" | "Critical" | "Pending";
  remarks?: string;
  verifiedBy?: mongoose.Types.ObjectId;
  reportUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const LabResultSchema: Schema = new Schema(
  {
    orderId: { type: Schema.Types.ObjectId, ref: "LabOrder", required: true },
    testId: { type: Schema.Types.ObjectId, ref: "TestCatalog", required: true },
    patientId: { type: Schema.Types.ObjectId, ref: "Patient", required: true },
    resultValue: { type: String, required: true },
    referenceRange: { type: String },
    status: {
      type: String,
      enum: ["Normal", "Abnormal", "Critical", "Pending"],
      default: "Pending",
    },
    remarks: { type: String },
    verifiedBy: { type: Schema.Types.ObjectId, ref: "User" },
    reportUrl: { type: String },
  },
  { timestamps: true }
);

export const LabResult = mongoose.model<ILabResult>("LabResult", LabResultSchema, "LabResult");
export default mongoose.model<ILabResult>(
  "LabResult",
  LabResultSchema,
  "labresults"
);