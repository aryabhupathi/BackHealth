import mongoose, { Schema, Document, Types } from "mongoose";
export enum UserRole {
  Admin = "Admin",
  Doctor = "Doctor",
  Patient = "Patient",
}
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  verified: boolean;
  linkedProfile?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.Patient,
    },
    verified: { type: Boolean, default: false },
    linkedProfile: {
      type: Schema.Types.ObjectId,
      refPath: "role",
    },
  },
  { timestamps: true }
);
export default mongoose.model<IUser>("User", UserSchema, "users");
