import mongoose, { Schema, Document } from "mongoose";

/* --------------------- Drug Catalog --------------------- */
export interface IDrug extends Document {
  drugCode: string;
  name: string;
  category: string;
  form: string; // tablet, syrup, injection
  strength: string; // e.g., 500mg, 10ml
  manufacturer?: string;
  price: number;
  stock: number; // quick lookup for availability
  expiryDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const DrugSchema = new Schema(
  {
    drugCode: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    form: { type: String, required: true },
    strength: { type: String, required: true },
    manufacturer: { type: String },
    price: { type: Number, required: true },
    stock: { type: Number, default: 0 },
    expiryDate: { type: Date, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IDrug>(
  "Drug",
  DrugSchema,
  "drugs"
);