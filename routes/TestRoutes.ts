import express from "express";
import Prescription from "../models/drugs/Prescription";
import LabOrder from "../models/labs/LabOrder";
import LabResult from "../models/labs/LabResult";
const router = express.Router();
router.get("/:id/tests", async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id).populate(
      "tests.test",
      "name sampleType turnaroundTime price"
    );
    if (!prescription)
      return res.status(404).json({ message: "Prescription not found" });
    res.json(prescription.tests);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch tests" });
  }
});
router.post("/", async (req, res) => {
  const { prescriptionId, patientId, doctorId, testIds } = req.body;
  try {
    const prescription = await Prescription.findById(prescriptionId);
    if (!prescription)
      return res.status(404).json({ message: "Prescription not found" });
    const allowedTests = prescription.tests.map((t) => t.test.toString());
    const invalidTest = testIds.find(
      (id: string) => !allowedTests.includes(id)
    );
    if (invalidTest)
      return res.status(400).json({ message: "Invalid test selected" });
    const order = await LabOrder.create({
      prescription: prescriptionId,
      patient: patientId,
      doctor: doctorId,
      tests: testIds.map((id: string) => ({ test: id })),
    });
    prescription.tests.forEach((t) => {
      if (testIds.includes(t.test.toString())) t.isBooked = true;
    });
    await prescription.save();
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ error: "Failed to book tests" });
  }
});
router.get("/patient/:patientId", async (req, res) => {
  try {
    const orders = await LabOrder.find({ patient: req.params.patientId })
      .populate("tests.test", "name sampleType")
      .populate("doctor", "fullName");
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch lab orders" });
  }
});
router.patch("/:id/status", async (req, res) => {
  const { status } = req.body;
  try {
    const order = await LabOrder.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: "Status update failed" });
  }
});
router.post("/", async (req, res) => {
  const { orderId, testId, patientId, result, status, remarks, reportUrl } =
    req.body;
  try {
    const order = await LabOrder.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });
    const labResult = await LabResult.create({
      order: orderId,
      test: testId,
      patient: patientId,
      result,
      status,
      remarks,
      reportUrl,
    });
    order.tests.forEach((t) => {
      if (t.test.toString() === testId) t.status = "Completed";
    });
    if (order.tests.every((t) => t.status === "Completed")) {
      order.status = "Completed";
    }
    await order.save();
    res.status(201).json(labResult);
  } catch (err) {
    res.status(500).json({ error: "Failed to upload result" });
  }
});
router.get("/patient/:patientId", async (req, res) => {
  try {
    const reports = await LabResult.find({
      patient: req.params.patientId,
    }).populate("test", "name");
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch reports" });
  }
});
export default router;
