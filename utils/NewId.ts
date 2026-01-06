import Counter from "./counter";
type GenerateIdOptions = {
  key: string;
  prefix: string;
  pad?: number;
};
export async function generateId({
  key,
  prefix,
  pad = 3,
}: GenerateIdOptions): Promise<string> {
  const counter = await Counter.findOneAndUpdate(
    { key },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  if (!counter) {
    throw new Error("Failed to generate ID");
  }
  return `${prefix}${counter.seq.toString().padStart(pad, "0")}`;
}
