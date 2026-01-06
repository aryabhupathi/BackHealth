import mongoose, { Schema, Document } from "mongoose";
export interface ILabTest extends Document {
  code: string;
  name: string;
  department: string;
  sampleType: "Blood" | "Urine" | "Saliva" | "Imaging" | "Other";
  price: number;
  referenceRange?: string;
  turnaroundTime: string;
  isActive: boolean;
}
const LabTestSchema = new Schema(
  {
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    department: { type: String, required: true },
    sampleType: {
      type: String,
      enum: ["Blood", "Urine", "Saliva", "Imaging", "Other"],
      required: true,
    },
    price: { type: Number, required: true },
    referenceRange: String,
    turnaroundTime: { type: String, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);
export default mongoose.model<ILabTest>("LabTest", LabTestSchema, "labTests");
