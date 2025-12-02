import express, { Request, Response } from "express";
import Bill from "../models/Bills";
import Patient from "../models/Patient";

const router = express.Router();

/**
 * @desc Get all bills (with pagination)
 * @route GET /api/bills
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [bills, total] = await Promise.all([
      Bill.find()
        .populate("patientId", "name age")
        .populate("doctorId", "name specialization")
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      Bill.countDocuments(),
    ]);

    res.json({
      success: true,
      data: bills,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit,
      },
    });
  } catch (err: any) {
    console.error("Error fetching bills:", err.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

/**
 * @desc Get bills for a specific patient
 * @route GET /api/bills/patient/:patientId
 */
router.get("/patient/:patientId", async (req: Request, res: Response) => {
  try {
    const bills = await Bill.find({ patientId: req.params.patientId })
      .populate("doctorId", "name specialization")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: bills });
  } catch (err: any) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

/**
 * @desc Get single bill by ID
 * @route GET /api/bills/:id
 */
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const bill = await Bill.findById(req.params.id)
      .populate("patientId", "name age")
      .populate("doctorId", "name specialization");

    if (!bill)
      return res
        .status(404)
        .json({ success: false, message: "Bill not found" });

    res.json({ success: true, data: bill });
  } catch (err: any) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

/**
 * @desc Create a new bill
 * @route POST /api/bills
 */
router.post("/", async (req: Request, res: Response) => {
  try {
    const { patientId, items, doctorId, paymentMethod } = req.body;

    // ensure patient exists
    const patientExists = await Patient.findById(patientId);
    if (!patientExists) {
      return res.status(400).json({ success: false, message: "Invalid patient" });
    }

    // calculate total amount
    const totalAmount = items.reduce(
      (acc: number, item: { cost: number }) => acc + item.cost,
      0
    );

    const bill = await Bill.create({
      patientId,
      doctorId,
      items,
      totalAmount,
      paidAmount: 0,
      status: "Pending",
      paymentMethod,
    });

    res.status(201).json({ success: true, data: bill });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: "Invalid data",
      error: err.message,
    });
  }
});

/**
 * @desc Update a bill
 * @route PUT /api/bills/:id
 */
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const bill = await Bill.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!bill)
      return res
        .status(404)
        .json({ success: false, message: "Bill not found" });

    res.json({ success: true, data: bill });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: "Update failed",
      error: err.message,
    });
  }
});

/**
 * @desc Delete a bill
 * @route DELETE /api/bills/:id
 */
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const bill = await Bill.findByIdAndDelete(req.params.id);

    if (!bill)
      return res
        .status(404)
        .json({ success: false, message: "Bill not found" });

    res.json({ success: true, message: "Bill deleted" });
  } catch (err: any) {
    res.status(500).json({ success: false, message: "Delete failed" });
  }
});

export default router;
