// import mongoose, { Schema, Document, Types } from "mongoose";
// export interface IContact {
//   phone: string;
//   address?: string;
// }
// export interface IInsurance {
//   provider?: string;
//   policyNumber?: string;
// }
// export interface IPatient extends Document {
//   patientId: string;
//   userId?: Types.ObjectId;
//   fullName: string;
//   email?: string;
//   dob?: Date;
//   gender?: string;
//   bloodGroup?: string;
//   allergies?: string[];
//   conditions?: string[];
//   medications?: string[];
//   contact: IContact;
//   insurance?: IInsurance;
// }
// const PatientSchema = new Schema<IPatient>(
//   {
//     patientId: { type: String, unique: true, required: true },
//     userId: { type: Schema.Types.ObjectId, ref: "User" },
//     fullName: { type: String, required: true },
//     email: { type: String, lowercase: true },
//     gender: String,
//     dob: String,
//     bloodGroup: String,
//     allergies: { type: [String], default: [] },
//     conditions: { type: [String], default: [] },
//     medications: { type: [String], default: [] },
//     contact: {
//       phone: { type: String, required: true },
//       address: String,
//     },
//     insurance: {
//       provider: String,
//       policyNumber: String,
//     },
//   },
//   { timestamps: true }
// );
// export default mongoose.model<IPatient>("Patient", PatientSchema, "patients");


import mongoose, { Schema, Document, Types } from "mongoose";
export interface IContact {
  phone: string;
  address?: string;
}
export interface IAllergy {
  name: string;
  severity: "Mild" | "Moderate" | "Severe";
  reaction?: string;
}

export interface IInsurance {
  provider?: string;
  policyNumber?: string;
}
export interface IPatient extends Document {
  patientId: string;
  userId?: Types.ObjectId;
  fullName: string;
  email?: string;
  dob?: Date;
  gender?: string;
  bloodGroup?: string;

  allergies: IAllergy[];          // ✅ CORRECT
  conditions: string[];
  medications: string[];

  contact: IContact;
  insurance?: IInsurance;
}

const PatientSchema = new Schema<IPatient>(
  {
    patientId: { type: String, unique: true, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User" },

    fullName: { type: String, required: true },
    email: { type: String, lowercase: true },

    gender: String,
    dob: Date,                 // ✅ FIXED
    bloodGroup: String,

    allergies: [
      {
        name: { type: String, required: true },
        severity: {
          type: String,
          enum: ["Mild", "Moderate", "Severe"],
          required: true,
        },
        reaction: String,
      },
    ],

    conditions: { type: [String], default: [] },
    medications: { type: [String], default: [] },

    contact: {
      phone: { type: String, required: true },
      address: String,
    },

    insurance: {
      provider: String,
      policyNumber: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IPatient>("Patient", PatientSchema, "patients");
