import express from "express";
import mongoose from "mongoose";
import Prescription from "../models/drugs/Prescription";
import LabOrder from "../models/labs/LabOrder";
import LabTest from "../models/labs/LabTest";

const router = express.Router();

/**
 * GET tests allowed from prescription
 */
router.get("/prescription/:id/tests", async (req, res) => {
  const prescription = await Prescription.findById(req.params.id).populate(
    "tests.test",
    "name sampleType turnaroundTime price",
  );

  if (!prescription)
    return res.status(404).json({ message: "Prescription not found" });

  res.json(prescription.tests);
});

/**
 * POST create lab order (payment required)
 */
router.post("/", async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { prescriptionId, patientId, doctorId, testIds } = req.body;

    const prescription = await Prescription.findById(prescriptionId);
    if (!prescription) throw new Error("Prescription not found");

    const allowedTests = prescription.tests.map((t) => t.test.toString());
    if (testIds.some((id: string) => !allowedTests.includes(id)))
      throw new Error("Invalid test selected");

    const labTests = await LabTest.find({ _id: { $in: testIds } });
    if (labTests.length !== testIds.length) throw new Error("Test not found");

    const tests = labTests.map((t) => ({
      test: t._id,
      priceAtBooking: t.price,
      status: "Pending",
    }));

    const totalAmount = tests.reduce((sum, t) => sum + t.priceAtBooking, 0);

    const order = await LabOrder.create(
      [
        {
          prescription: prescriptionId,
          patient: patientId,
          doctor: doctorId,
          tests,
          totalAmount,
          paymentStatus: "PENDING",
          status: "CREATED",
        },
      ],
      { session },
    );

    prescription.tests.forEach((t) => {
      if (testIds.includes(t.test.toString())) t.isBooked = true;
    });

    await prescription.save({ session });
    await session.commitTransaction();

    res.status(201).json({
      orderId: order[0]._id,
      totalAmount,
      paymentRequired: true,
    });
  } catch (err: any) {
    await session.abortTransaction();
    res.status(400).json({ error: err.message });
  } finally {
    session.endSession();
  }
});

/**
 * GET patient lab orders
 */
router.get("/patient/:patientId", async (req, res) => {
  const orders = await LabOrder.find({ patient: req.params.patientId })
    .populate("tests.test", "name sampleType")
    .populate("doctor", "fullName")
    .sort({ createdAt: -1 });

  res.json(orders);
});

/**
 * PATCH update order status (lab/admin)
 */
router.patch("/:id/status", async (req, res) => {
  const order = await LabOrder.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true },
  );

  if (!order) return res.status(404).json({ message: "Order not found" });

  res.json(order);
});

export default router;
