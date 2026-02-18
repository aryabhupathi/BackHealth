


import mongoose, { Schema, Document } from "mongoose";

export interface ILabTest extends Document {
  code: string;
  billingCode?: string;

  name: string;
  department: string;

  sampleType: "Blood" | "Urine" | "Saliva" | "Imaging" | "Other";

  price: number;
  priceType: "FIXED" | "VARIABLE";

  isTaxable: boolean;

  referenceRange?: string;
  turnaroundTime: string;

  preparationInstructions?: string;

  homeCollectionAllowed: boolean;

  isActive: boolean;
}

const LabTestSchema = new Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      index: true,
    },

    billingCode: {
      type: String,
    },

    name: {
      type: String,
      required: true,
      index: true,
    },

    department: {
      type: String,
      required: true,
      index: true,
    },

    sampleType: {
      type: String,
      enum: ["Blood", "Urine", "Saliva", "Imaging", "Other"],
      required: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    priceType: {
      type: String,
      enum: ["FIXED", "VARIABLE"],
      default: "FIXED",
    },

    isTaxable: {
      type: Boolean,
      default: false,
    },

    referenceRange: String,

    turnaroundTime: {
      type: String,
      required: true,
    },

    preparationInstructions: {
      type: String,
    },

    homeCollectionAllowed: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model<ILabTest>("LabTest", LabTestSchema, "labTests");
