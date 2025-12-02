
import mongoose, { Schema, Document } from "mongoose";

export interface ILabOrder extends Document {
  orderId: string;
  patientId: mongoose.Types.ObjectId;
  doctorId: mongoose.Types.ObjectId;
  tests: { testId: mongoose.Types.ObjectId; status: string }[];
  status: "Pending" | "Sample Collected" | "In Progress" | "Completed" | "Report Ready";
  orderDate: Date;
  expectedDelivery?: Date;
}

const LabOrderSchema: Schema = new Schema(
  {
    orderId: { type: String, required: true, unique: true, index: true },
    patientId: { type: Schema.Types.ObjectId, ref: "Patient", required: true },
    doctorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    tests: [
      {
        testId: { type: Schema.Types.ObjectId, ref: "TestCatalog", required: true },
        status: {
          type: String,
          enum: ["Pending", "In Progress", "Completed"],
          default: "Pending",
        },
      },
    ],
    status: {
      type: String,
      enum: ["Pending", "Sample Collected", "In Progress", "Completed", "Report Ready"],
      default: "Pending",
    },
    orderDate: { type: Date, default: Date.now },
    expectedDelivery: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model<ILabOrder>(
  "LabOrder",
  LabOrderSchema,
  "laborders"
);