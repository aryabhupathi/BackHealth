// routes/labs.ts
import express, { Request, Response } from "express";
import LabTest from "../models/labs/LabTest";
import LabOrder from "../models/labs/LabOrder";
import LabResult from "../models/labs/LabResult";

const router = express.Router();

/* ===============================
   1. TEST CATALOG ROUTES
================================= */

// Create new test
router.post("/catalog", async (req: Request, res: Response) => {
  try {
    const test = new LabTest(req.body);
    await test.save();
    res.status(201).json(test);
  } catch (err) {
    res.status(400).json({ error: "Failed to create test", details: err });
  }
});

// Get all tests
router.get("/catalog", async (_req: Request, res: Response) => {
  try {
    const tests = await LabTest.find();
    res.json(tests);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch tests" });
  }
});

// Update a test
router.put("/catalog/:id", async (req: Request, res: Response) => {
  try {
    const test = await LabTest.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!test) return res.status(404).json({ error: "Test not found" });
    res.json(test);
  } catch (err) {
    res.status(400).json({ error: "Failed to update test" });
  }
});

// Delete a test
router.delete("/catalog/:id", async (req: Request, res: Response) => {
  try {
    const test = await LabTest.findByIdAndDelete(req.params.id);
    if (!test) return res.status(404).json({ error: "Test not found" });
    res.json({ message: "Test deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete test" });
  }
});

/* ===============================
   2. LAB ORDERS ROUTES
================================= */

// Create new lab order
router.post("/orders", async (req: Request, res: Response) => {
  try {
    const order = new LabOrder(req.body);
    await order.save();
    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ error: "Failed to create order", details: err });
  }
});

// Get all lab orders
router.get("/orders", async (_req: Request, res: Response) => {
  try {
    const orders = await LabOrder.find()
      .populate("patientId doctorId tests.testId", "name email")
      .exec();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// Get single order
router.get("/orders/:id", async (req: Request, res: Response) => {
  try {
    const order = await LabOrder.findById(req.params.id)
      .populate("patientId doctorId tests.testId")
      .exec();
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch order" });
  }
});

// Update order status
router.put("/orders/:id", async (req: Request, res: Response) => {
  try {
    const order = await LabOrder.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json(order);
  } catch (err) {
    res.status(400).json({ error: "Failed to update order" });
  }
});

// Delete an order
router.delete("/orders/:id", async (req: Request, res: Response) => {
  try {
    const order = await LabOrder.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json({ message: "Order deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete order" });
  }
});

/* ===============================
   3. LAB RESULTS ROUTES
================================= */

// Add a lab result
router.post("/results", async (req: Request, res: Response) => {
  try {
    const result = new LabResult(req.body);
    await result.save();
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: "Failed to add result", details: err });
  }
});

// Get results for a patient
router.get("/results/patient/:patientId", async (req: Request, res: Response) => {
  try {
    const results = await LabResult.find({ patientId: req.params.patientId })
      .populate("testId orderId verifiedBy", "name testCode")
      .exec();
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch patient results" });
  }
});

// Update a result
router.put("/results/:id", async (req: Request, res: Response) => {
  try {
    const result = await LabResult.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!result) return res.status(404).json({ error: "Result not found" });
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: "Failed to update result" });
  }
});

// Delete a result
router.delete("/results/:id", async (req: Request, res: Response) => {
  try {
    const result = await LabResult.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ error: "Result not found" });
    res.json({ message: "Result deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete result" });
  }
});

export default router;
