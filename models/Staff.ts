// models/Staff.ts
import mongoose, { Schema, Document } from "mongoose";

export type StaffRole = "doctor" | "nurse" | "lab_tech" | "pharmacist" | "admin" | "support";
export type EmploymentType = "permanent" | "contract" | "visiting";
export type StaffStatus = "active" | "on_leave" | "inactive" | "retired";

export interface IContact {
  phone?: string;
  email?: string;
  address?: string;
}

export interface IScheduleSlot {
  day: string; // e.g., "Monday"
  start: string; // "09:00"
  end: string; // "17:00"
}

export interface ICertification {
  name: string;
  institution?: string;
  year?: number;
  fileUrl?: string;
}

export interface ILeave {
  type: "annual" | "sick" | "unpaid" | "maternity" | "paternity" | "other";
  from: Date;
  to: Date;
  reason?: string;
  approvedBy?: mongoose.Types.ObjectId;
  status: "pending" | "approved" | "rejected";
}

export interface IAttendance {
  date: Date;
  inTime?: string;
  outTime?: string;
  status: "present" | "absent" | "on_leave";
  notes?: string;
}

export interface IStaff extends Document {
  staffId: string;
  name: string;
  photoUrl?: string;
  dob?: Date;
  gender?: "Male" | "Female" | "Other";
  role: StaffRole;
  specialization?: string; // for doctors
  department?: mongoose.Types.ObjectId; // link to Department
  contact: IContact;
  qualifications?: string[]; // quick list
  certifications?: ICertification[];
  schedule?: IScheduleSlot[]; // weekly schedule
  employment: {
    type: EmploymentType;
    joinedAt?: Date;
    employeeCode?: string;
  };
  status: StaffStatus;
  permissions?: string[]; // e.g., ['view_records','prescribe']
  leaves?: ILeave[];
  attendance?: IAttendance[];
  createdAt: Date;
  updatedAt: Date;
}

const ScheduleSlotSchema = new Schema<IScheduleSlot>(
  {
    day: { type: String, required: true },
    start: { type: String, required: true },
    end: { type: String, required: true },
  },
  { _id: false }
);

const CertificationSchema = new Schema<ICertification>(
  {
    name: { type: String, required: true },
    institution: String,
    year: Number,
    fileUrl: String,
  },
  { _id: false }
);

const LeaveSchema = new Schema<ILeave>(
  {
    type: { type: String, required: true },
    from: { type: Date, required: true },
    to: { type: Date, required: true },
    reason: String,
    approvedBy: { type: Schema.Types.ObjectId, ref: "User" },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  },
  { timestamps: true, _id: false }
);

const AttendanceSchema = new Schema<IAttendance>(
  {
    date: { type: Date, required: true },
    inTime: String,
    outTime: String,
    status: { type: String, enum: ["present", "absent", "on_leave"], required: true },
    notes: String,
  },
  { _id: false }
);

const StaffSchema = new Schema<IStaff>(
  {
    staffId: { type: String, required: true, unique: true, index: true }, // e.g., S-1001
    name: { type: String, required: true, trim: true },
    photoUrl: String,
    dob: Date,
    gender: { type: String, enum: ["Male", "Female", "Other"] },
    role: {
      type: String,
      enum: ["doctor", "nurse", "lab_tech", "pharmacist", "admin", "support"],
      required: true,
    },
    specialization: String,
    department: { type: Schema.Types.ObjectId, ref: "Department" },
    contact: {
      phone: String,
      email: { type: String, lowercase: true, index: true },
      address: String,
    },
    qualifications: [{ type: String }],
    certifications: [CertificationSchema],
    schedule: [ScheduleSlotSchema],
    employment: {
      type: {
        type: String,
        enum: ["permanent", "contract", "visiting"],
        default: "permanent",
      },
      joinedAt: Date,
      employeeCode: String,
    },
    status: {
      type: String,
      enum: ["active", "on_leave", "inactive", "retired"],
      default: "active",
    },
    permissions: [{ type: String }],
    leaves: [LeaveSchema],
    attendance: [AttendanceSchema],
  },
  { timestamps: true }
);

// Auto-generate staffId if not present, simple incremental style (basic)
StaffSchema.pre<IStaff>("save", async function (next) {
  if (!this.staffId) {
    const count = await mongoose.model<IStaff>("Staff").countDocuments();
    this.staffId = `S-${1000 + count + 1}`;
  }
  next();
});

export default mongoose.model<IStaff>("Staff", StaffSchema, "staffs");
