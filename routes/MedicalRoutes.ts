import express from "express";
import MedicalRecord from "../models/MedicalRecord";
const router = express.Router();
router.get("/", async (req, res) => {
  try {
    const records = await MedicalRecord.find()
      .populate("patientId", "name email")
      .populate("doctorId", "name email");
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: "Server Error" });
  }
});
router.get("/:id", async (req, res) => {
  try {
    const record = await MedicalRecord.findById(req.params.id)
      .populate("patientId", "name email")
      .populate("doctorId", "name email");
    if (!record) return res.status(404).json({ error: "Record not found" });
    res.json(record);
  } catch (err) {
    res.status(500).json({ error: "Server Error" });
  }
});
router.post("/", async (req, res) => {
  try {
    const record = new MedicalRecord(req.body);
    await record.save();
    res.status(201).json(record);
  } catch (err) {
    res.status(400).json({ error: "Invalid data" });
  }
});
router.put("/:id", async (req, res) => {
  try {
    const record = await MedicalRecord.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!record) return res.status(404).json({ error: "Record not found" });
    res.json(record);
  } catch (err) {
    res.status(400).json({ error: "Invalid data" });
  }
});
router.delete("/:id", async (req, res) => {
  try {
    const record = await MedicalRecord.findByIdAndDelete(req.params.id);
    if (!record) return res.status(404).json({ error: "Record not found" });
    res.json({ message: "Record deleted" });
  } catch (err) {
    res.status(500).json({ error: "Server Error" });
  }
});
// router.patch("/:id/verify-doc/:docId", async (req, res) => {
//   try {
//     const { id, docId } = req.params;
//     const { verifiedBy } = req.body; // admin ID
//     const record = await MedicalRecord.findById(id);
//     if (!record) return res.status(404).json({ error: "Record not found" });
//     const doc = record.documents.id(docId);
//     if (!doc) return res.status(404).json({ error: "Document not found" });
//     doc.verified = true;
//     doc.verifiedBy = verifiedBy;
//     doc.verifiedAt = new Date();
//     await record.save();
//     res.json(record);
//   } catch (err) {
//     res.status(500).json({ error: "Server Error" });
//   }
// });
export default router;
