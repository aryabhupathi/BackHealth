import mongoose, { Schema, Document } from "mongoose";
export interface IMedication {
  name: string;
  dosage: string;
  duration: string;
}
export interface IDocument {
  type: string;
  url: string;
  verified: boolean;
  verifiedBy?: mongoose.Types.ObjectId;
  verifiedAt?: Date;
}
export interface IMedicalRecord extends Document {
  patientId: mongoose.Types.ObjectId;
  doctorId: mongoose.Types.ObjectId;
  diagnoses: string[];
  allergies: string[];
  medications: IMedication[];
  documents: IDocument[];
  createdAt: Date;
  updatedAt: Date;
}
const MedicationSchema = new Schema<IMedication>({
  name: { type: String, required: true },
  dosage: { type: String, required: true },
  duration: { type: String, required: true },
});
const DocumentSchema = new Schema<IDocument>({
  type: { type: String, required: true },
  url: { type: String, required: true },
  verified: { type: Boolean, default: false },
  verifiedBy: { type: Schema.Types.ObjectId, ref: "User" },
  verifiedAt: { type: Date },
});
const MedicalRecordSchema = new Schema<IMedicalRecord>(
  {
    patientId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    doctorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    diagnoses: [{ type: String }],
    allergies: [{ type: String }],
    medications: [MedicationSchema],
    documents: [DocumentSchema],
  },
  { timestamps: true }
);
export default mongoose.model<IMedicalRecord>(
  "MedicalRecord",
  MedicalRecordSchema,
  "records"
);
