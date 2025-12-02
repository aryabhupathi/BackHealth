import mongoose, { Schema, Document } from "mongoose";

export interface IAdmission extends Document {
  patient: mongoose.Types.ObjectId; // reference to Patient
  admissionNumber: string;
  admissionDate: Date;
  dischargeDate?: Date | null;
  department: string;
  status: "Active" | "Discharged";
  createdAt: Date;
  updatedAt: Date;
}

const AdmissionSchema = new Schema<IAdmission>(
  {
    patient: { type: Schema.Types.ObjectId, ref: "Patient", required: true },
    admissionNumber: { type: String, required: true, unique: true },
    admissionDate: { type: Date, default: Date.now },
    dischargeDate: { type: Date, default: null },
    department: { type: String, required: true },
    status: { type: String, enum: ["Active", "Discharged"], default: "Active" },
  },
  { timestamps: true }
);

/**
 * 🔹 Auto-increment admissionNumber (ADM-0001, ADM-0002, etc.)
 */
AdmissionSchema.pre<IAdmission>("save", async function (next) {
  if (!this.admissionNumber) {
    const count = await mongoose.model<IAdmission>("Admission").countDocuments();
    this.admissionNumber = `ADM-${String(count + 1).padStart(4, "0")}`;
  }

  // 🔹 Auto-set or clear dischargeDate
  if (this.isModified("status")) {
    if (this.status === "Discharged" && !this.dischargeDate) {
      this.dischargeDate = new Date();
    } else if (this.status === "Active") {
      this.dischargeDate = null;
    }
  }

  next();
});

export default mongoose.model<IAdmission>("Admission", AdmissionSchema, "admissions");


// import mongoose, { Schema, Document } from "mongoose";
// import { IPatient } from "./Patient";

// export interface IAdmission extends Document {
//   admissionNumber: number; // auto-increment per admission
//   patient: mongoose.Types.ObjectId | IPatient;
//   department: string;
//   ward?: string;
//   reason?: string;
//   status: "Active" | "Discharged";
//   admissionDate: Date;
//   dischargeDate?: Date | null;
//   createdAt: Date;
//   updatedAt: Date;
// }

// const AdmissionSchema: Schema = new Schema(
//   {
//     admissionNumber: { type: Number, unique: true, index: true },
//     patient: { type: Schema.Types.ObjectId, ref: "Patient", required: true },
//     department: { type: String, required: true },
//     ward: { type: String },
//     reason: { type: String },
//     status: { type: String, enum: ["Active", "Discharged"], default: "Active" },
//     admissionDate: { type: Date, default: Date.now },
//     dischargeDate: { type: Date },
//   },
//   { timestamps: true }
// );

// /**
//  * 🔹 Auto-increment admission number
//  */
// AdmissionSchema.pre<IAdmission>("save", async function (next) {
//   if (!this.admissionNumber) {
//     const lastAdmission = await mongoose
//       .model<IAdmission>("Admission")
//       .findOne({}, {}, { sort: { admissionNumber: -1 } });

//     this.admissionNumber = lastAdmission
//       ? lastAdmission.admissionNumber + 1
//       : 1;
//   }
//   next();
// });

// /**
//  * 🔹 Auto-set dischargeDate if status changes
//  *    - Set new Date() if "Discharged"
//  *    - Reset to null if switched back to "Active"
//  */
// AdmissionSchema.pre<IAdmission>("save", function (next) {
//   if (this.isModified("status")) {
//     if (this.status === "Discharged") {
//       this.dischargeDate = new Date();
//     } else if (this.status === "Active") {
//       this.dischargeDate = null;
//     }
//   }
//   next();
// });

// export default mongoose.model<IAdmission>(
//   "Admission",
//   AdmissionSchema,
//   "admissions"
// );
