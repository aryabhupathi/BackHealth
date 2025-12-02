// models/Department.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IService {
  name: string;
  code?: string;
  description?: string;
  cost?: number;
}

export interface IDepartment extends Document {
  name: string;
  code: string;
  description?: string;
  location?: string;
  contact?: {
    phone?: string;
    email?: string;
  };
  headOfDepartment?: mongoose.Types.ObjectId; // Reference to a Doctor/User
  staff: mongoose.Types.ObjectId[]; // Linked doctors/nurses
  services: IService[];
  createdAt: Date;
  updatedAt: Date;
}

const ServiceSchema = new Schema<IService>({
  name: { type: String, required: true },
  code: { type: String },
  description: { type: String },
  cost: { type: Number },
});

const DepartmentSchema = new Schema<IDepartment>(
  {
    name: { type: String, required: true, unique: true },
    code: { type: String, required: true, unique: true },
    description: { type: String },
    location: { type: String },
    contact: {
      phone: { type: String },
      email: { type: String },
    },
    headOfDepartment: { type: Schema.Types.ObjectId, ref: "User" },
    staff: [{ type: Schema.Types.ObjectId, ref: "User" }],
    services: [ServiceSchema],
  },
  { timestamps: true }
);

export default mongoose.model<IDepartment>(
  "Department",
  DepartmentSchema,
  "departments"
);
