// models/Labs.ts
import mongoose, { Schema, Document } from "mongoose";

/* ===============================
   1. Test Catalog Schema
================================= */
export interface ILabTest extends Document {
  testCode: string;
  name: string;
  department: string;
  description?: string;
  sampleType: "Blood" | "Urine" | "Saliva" | "Stool" | "Biopsy" | "Imaging" | "Other";
  price: number;
  referenceRange?: string;
  turnaroundTime: string;
  createdAt: Date;
  updatedAt: Date;
}

const LabTestSchema: Schema = new Schema(
  {
    testCode: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    department: { type: String, required: true },
    description: { type: String },
    sampleType: {
      type: String,
      enum: ["Blood", "Urine", "Saliva", "Stool", "Biopsy", "Imaging", "Other"],
      required: true,
    },
    price: { type: Number, required: true },
    referenceRange: { type: String },
    turnaroundTime: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<ILabTest>(
  "LabTest",
  LabTestSchema,
  "labtests"
);
