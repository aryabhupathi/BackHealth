import mongoose, { Schema, Document } from "mongoose";
export interface IInventory extends Document {
  itemCode: string;
  itemName: string;
  type: "Drug" | "Supply" | "Equipment";
  quantity: number;
  unit: string; // tablets, bottles, packs, etc.
  batchNo?: string;
  expiryDate?: Date;
  supplier?: string;
  reorderLevel: number;
  lastRestockedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const InventorySchema = new Schema(
  {
    itemCode: { type: String, required: true, unique: true },
    itemName: { type: String, required: true },
    type: {
      type: String,
      enum: ["Drug", "Supply", "Equipment"],
      required: true,
    },
    quantity: { type: Number, default: 0 },
    unit: { type: String, required: true },
    batchNo: { type: String },
    expiryDate: { type: Date },
    supplier: { type: String },
    reorderLevel: { type: Number, default: 10 },
    lastRestockedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model<IInventory>(
  "Inventory",
  InventorySchema,
  "inventorys"
);
