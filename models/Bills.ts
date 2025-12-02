import mongoose, { Schema, Document } from "mongoose";

export interface IBill extends Document {
  patientId: mongoose.Types.ObjectId;
  doctorId?: mongoose.Types.ObjectId;
  items: {
    description: string;
    cost: number;
  }[];
  totalAmount: number;
  paidAmount: number;
  status: "Pending" | "Paid" | "Overdue";
  paymentMethod?: "Cash" | "Card" | "Insurance" | "Online";
  createdAt: Date;
  updatedAt: Date;
}

const BillSchema: Schema = new Schema(
  {
    patientId: { type: Schema.Types.ObjectId, ref: "Patient", required: true },
    doctorId: { type: Schema.Types.ObjectId, ref: "User" },
    items: [
      {
        description: { type: String, required: true },
        cost: { type: Number, required: true },
      },
    ],
    totalAmount: { type: Number, required: true },
    paidAmount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["Pending", "Paid", "Overdue"],
      default: "Pending",
    },
    paymentMethod: {
      type: String,
      enum: ["Cash", "Card", "Insurance", "Online"],
    },
  },
  { timestamps: true }
);

export default mongoose.model<IBill>("Bill", BillSchema, "bills");
