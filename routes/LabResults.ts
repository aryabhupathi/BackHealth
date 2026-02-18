import express from "express";
import LabOrder from "../models/labs/LabOrder";
import LabResult from "../models/labs/LabResult";

const router = express.Router();

/**
 * POST upload lab result
 */
router.post("/", async (req, res) => {
  const { orderId, testId, patientId, result, remarks, reportUrl } = req.body;

  const order = await LabOrder.findById(orderId);
  if (!order) return res.status(404).json({ message: "Order not found" });

  const labResult = await LabResult.create({
    order: orderId,
    test: testId,
    patient: patientId,
    result,
    status: "Completed",
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
});

/**
 * GET patient lab reports
 */
router.get("/patient/:patientId", async (req, res) => {
  const reports = await LabResult.find({
    patient: req.params.patientId,
  }).populate("test", "name");

  res.json(reports);
});

export default router;
