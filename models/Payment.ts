import mongoose, { Schema, Document } from "mongoose";

export interface IPayment extends Document {
  paymentId: string;

  referenceType: "APPOINTMENT" | "TEST_BOOKING";
  referenceId: mongoose.Types.ObjectId;

  amount: number;
  currency: string;

  status: "INITIATED" | "SUCCESS" | "FAILED" | "REFUNDED";

  method: "CARD" | "UPI" | "NETBANKING" | "WALLET" | "CASH";

  gateway?: "RAZORPAY" | "STRIPE" | "PAYPAL";
  gatewayPaymentId?: string;

  initiatedBy: "PATIENT" | "SYSTEM";
}

const PaymentSchema = new Schema(
  {
    paymentId: {
      type: String,
      unique: true,
      index: true,
    },

    referenceType: {
      type: String,
      enum: ["APPOINTMENT", "TEST_BOOKING"],
      required: true,
    },

    referenceId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      default: "INR",
    },

    status: {
      type: String,
      enum: ["INITIATED", "SUCCESS", "FAILED", "REFUNDED"],
      default: "INITIATED",
    },

    method: {
      type: String,
      enum: ["CARD", "UPI", "NETBANKING", "WALLET", "CASH"],
      required: true,
    },

    gateway: {
      type: String,
      enum: ["RAZORPAY", "STRIPE", "PAYPAL"],
    },

    gatewayPaymentId: String,

    initiatedBy: {
      type: String,
      enum: ["PATIENT", "SYSTEM"],
      default: "PATIENT",
    },
  },
  { timestamps: true },
);

export default mongoose.model<IPayment>("Payment", PaymentSchema, "payments");
