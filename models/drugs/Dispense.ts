import mongoose, { Schema, Document } from "mongoose";
export interface IDispense extends Document {
  prescriptionId: mongoose.Types.ObjectId;
  patientId: mongoose.Types.ObjectId;
  pharmacistId: mongoose.Types.ObjectId;
  items: {
    drug: mongoose.Types.ObjectId;
    quantity: number;
  }[];
  dispensedAt: Date;
}

const DispenseSchema = new Schema(
  {
    prescriptionId: {
      type: mongoose.Types.ObjectId,
      ref: "Prescription",
      required: true,
    },
    patientId: { type: mongoose.Types.ObjectId, ref: "Patient", required: true },
    pharmacistId: { type: mongoose.Types.ObjectId, ref: "User", required: true },
    items: [
      {
        drug: { type: mongoose.Types.ObjectId, ref: "Drug", required: true },
        quantity: { type: Number, required: true },
      },
    ],
    dispensedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model<IDispense>(
  "Dispense",
  DispenseSchema,
  "dispenses"
);