import mongoose, { Schema, Document } from "mongoose";
export interface IAdminProfile extends Document {
  userId: mongoose.Types.ObjectId;
  permissions: string[];
}
const AdminProfileSchema = new Schema<IAdminProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    permissions: [{ type: String }],
  },
  { timestamps: true }
);
export default mongoose.model<IAdminProfile>(
  "AdminProfile",
  AdminProfileSchema,
  "AdminProfile"
);
