import mongoose, { Schema, Document } from "mongoose";
export interface IPrescription extends Document {
  appointment: mongoose.Types.ObjectId;
  doctor: mongoose.Types.ObjectId;
  patient: mongoose.Types.ObjectId;
  diagnosis: string;
  advice?: string;
  medicines: {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
  }[];
  tests: {
    test: mongoose.Types.ObjectId;
    instructions?: string;
    isBooked: boolean;
  }[];
}
const PrescriptionSchema = new Schema(
  {
    appointment: {
      type: Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
    },
    doctor: { type: Schema.Types.ObjectId, ref: "Doctor", required: true },
    patient: { type: Schema.Types.ObjectId, ref: "Patient", required: true },
    diagnosis: { type: String, required: true },
    advice: String,
    medicines: [
      {
        name: String,
        dosage: String,
        frequency: String,
        duration: String,
      },
    ],
    tests: [
      {
        test: { type: Schema.Types.ObjectId, ref: "LabTest" },
        instructions: String,
        isBooked: { type: Boolean, default: false },
      },
    ],
  },
  { timestamps: true }
);
export default mongoose.model<IPrescription>(
  "Prescription",
  PrescriptionSchema,
  "prescriptions"
);
