import mongoose, { Schema, Document } from "mongoose";
export interface IPrescription extends Document {
  appointment: mongoose.Types.ObjectId;
  doctor: mongoose.Types.ObjectId;
  patient: mongoose.Types.ObjectId;
  medicines: {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    notes?: string;
  }[];
  diagnosis: string;
  advice?: string;
  createdAt: Date;
}
const PrescriptionSchema = new Schema<IPrescription>({
  appointment: {
    type: Schema.Types.ObjectId,
    ref: "Appointment",
    required: true,
  },
  doctor: { type: Schema.Types.ObjectId, ref: "Doctor", required: true },
  patient: { type: Schema.Types.ObjectId, ref: "Patient", required: true },
  medicines: [
    {
      name: String,
      dosage: String,
      frequency: String,
      duration: String,
      notes: String,
    },
  ],
  diagnosis: { type: String, required: true },
  advice: { type: String },
  createdAt: { type: Date, default: Date.now },
});
export default mongoose.model<IPrescription>(
  "Prescription",
  PrescriptionSchema,
  "prescriptions"
);



// poId != corpId ==> all disabled
// poId != corpId ==> role-guest ==> save,submit disabled
// poId != corpId ==> role-admin ==> new iteration disabled
// poId == corpId ==> all enabled