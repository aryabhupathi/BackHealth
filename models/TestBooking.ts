// import mongoose, { Schema, Document } from "mongoose";
// export interface ITestBooking extends Document {
//   code: string;
//   name: string;
//   department: string;
//   sampleType: "Blood" | "Urine" | "Saliva" | "Imaging" | "Other";
//   price: number;
//   referenceRange?: string;
//   turnaroundTime: string;
//   isActive: boolean;
// }
// const TestBookingSchema = new Schema(
//   {
//     code: { type: String, required: true, unique: true },
//     name: { type: String, required: true },
//     department: { type: String, required: true },
//     sampleType: {
//       type: String,
//       enum: ["Blood", "Urine", "Saliva", "Imaging", "Other"],
//       required: true,
//     },
//     price: { type: Number, required: true },
//     referenceRange: String,
//     turnaroundTime: { type: String, required: true },
//     isActive: { type: Boolean, default: true },
//   },
//   { timestamps: true }
// );
// export default mongoose.model<ITestBooking>("TestBooking", TestBookingSchema, "testBookings");


import mongoose, { Schema, Document } from "mongoose";

export interface ITestBooking extends Document {
  bookingId: string;

  patient: mongoose.Types.ObjectId;

  tests: {
    test: mongoose.Types.ObjectId;
    priceAtBooking: number;
  }[];

  collectionMode: "HOME" | "LAB";

  status:
    | "CREATED"
    | "CONFIRMED"
    | "SAMPLE_COLLECTED"
    | "COMPLETED"
    | "CANCELLED";

  // 💳 Payment
  paymentStatus: "PENDING" | "PAID" | "REFUNDED";
  totalAmount: number;
  paidAmount: number;

  scheduledAt?: Date;
}

const TestBookingSchema = new Schema(
  {
    bookingId: {
      type: String,
      unique: true,
      index: true,
    },

    patient: {
      type: Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },

    tests: [
      {
        test: {
          type: Schema.Types.ObjectId,
          ref: "LabTest",
          required: true,
        },
        priceAtBooking: {
          type: Number,
          required: true,
        },
      },
    ],

    collectionMode: {
      type: String,
      enum: ["HOME", "LAB"],
      required: true,
    },

    status: {
      type: String,
      enum: [
        "CREATED",
        "CONFIRMED",
        "SAMPLE_COLLECTED",
        "COMPLETED",
        "CANCELLED",
      ],
      default: "CREATED",
    },

    paymentStatus: {
      type: String,
      enum: ["PENDING", "PAID", "REFUNDED"],
      default: "PENDING",
    },

    totalAmount: {
      type: Number,
      required: true,
    },

    paidAmount: {
      type: Number,
      default: 0,
    },

    scheduledAt: Date,
  },
  { timestamps: true },
);

export default mongoose.model<ITestBooking>(
  "TestBooking",
  TestBookingSchema,
  "testBookings",
);
