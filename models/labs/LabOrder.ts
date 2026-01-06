import mongoose, { Schema, Document } from "mongoose";
export interface ILabOrder extends Document {
  prescription: mongoose.Types.ObjectId;
  patient: mongoose.Types.ObjectId;
  doctor: mongoose.Types.ObjectId;
  tests: {
    test: mongoose.Types.ObjectId;
    status: "Pending" | "Completed";
  }[];
  status: "Booked" | "Sample Collected" | "Processing" | "Completed";
}
const LabOrderSchema = new Schema(
  {
    prescription: {
      type: Schema.Types.ObjectId,
      ref: "Prescription",
      required: true,
    },
    patient: { type: Schema.Types.ObjectId, ref: "Patient", required: true },
    doctor: { type: Schema.Types.ObjectId, ref: "Doctor", required: true },
    tests: [
      {
        test: { type: Schema.Types.ObjectId, ref: "LabTest" },
        status: {
          type: String,
          enum: ["Pending", "Completed"],
          default: "Pending",
        },
      },
    ],
    status: {
      type: String,
      enum: ["Booked", "Sample Collected", "Processing", "Completed"],
      default: "Booked",
    },
  },
  { timestamps: true }
);
export default mongoose.model<ILabOrder>(
  "LabOrder",
  LabOrderSchema,
  "labOrders"
);
