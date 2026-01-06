import mongoose, { Schema, Document, Model } from "mongoose";
export interface ICounter extends Document {
  key: string;
  seq: number;
}
const CounterSchema = new Schema<ICounter>({
  key: { type: String, required: true, unique: true },
  seq: { type: Number, default: 0 },
});
const Counter: Model<ICounter> =
  mongoose.models.Counter || mongoose.model<ICounter>("Counter", CounterSchema);
export default Counter;
