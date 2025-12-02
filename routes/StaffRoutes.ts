// routes/staff.ts
import express, { Request, Response } from "express";
import Staff from "../models/Staff";
import Department from "../models/Department"; // optional for assignment checks
import mongoose from "mongoose";

const router = express.Router();

/**
 * GET /api/staff
 * List staff with pagination and filters (role, department, status, search)
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    const page = parseInt((req.query.page as string) || "1");
    const limit = parseInt((req.query.limit as string) || "20");
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (req.query.role) filter.role = req.query.role;
    if (req.query.department) filter.department = req.query.department;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.q) {
      const q = req.query.q as string;
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { "contact.phone": { $regex: q, $options: "i" } },
        { staffId: { $regex: q, $options: "i" } },
        { specialization: { $regex: q, $options: "i" } },
      ];
    }

    const [items, total] = await Promise.all([
      Staff.find(filter)
        .populate("department", "name code")
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      Staff.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: items,
      pagination: { total, page, pages: Math.ceil(total / limit), limit },
    });
  } catch (err: any) {
    console.error("GET /api/staff error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * GET /api/staff/:id
 * Get single staff profile
 */
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: "Invalid ID" });

    const staff = await Staff.findById(id).populate("department", "name code");
    if (!staff) return res.status(404).json({ success: false, message: "Staff not found" });
    res.json({ success: true, data: staff });
  } catch (err: any) {
    console.error("GET /api/staff/:id error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * POST /api/staff
 * Create new staff
 */
router.post("/", async (req: Request, res: Response) => {
  try {
    // optional: validate department exists if provided
    if (req.body.department) {
      const exists = await Department.exists({ _id: req.body.department });
      if (!exists) return res.status(400).json({ success: false, message: "Invalid department" });
    }

    const staff = new Staff(req.body);
    await staff.save();
    res.status(201).json({ success: true, data: staff });
  } catch (err: any) {
    console.error("POST /api/staff error:", err);
    res.status(400).json({ success: false, message: "Create failed", error: err.message });
  }
});

/**
 * PUT /api/staff/:id
 * Update staff profile (partial allowed)
 */
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: "Invalid ID" });

    // If department is being set, ensure it exists
    if (req.body.department) {
      const exists = await Department.exists({ _id: req.body.department });
      if (!exists) return res.status(400).json({ success: false, message: "Invalid department" });
    }

    const updated = await Staff.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ success: false, message: "Staff not found" });

    res.json({ success: true, data: updated });
  } catch (err: any) {
    console.error("PUT /api/staff/:id error:", err);
    res.status(400).json({ success: false, message: "Update failed", error: err.message });
  }
});

/**
 * DELETE /api/staff/:id
 * Soft-delete style recommended, but here we remove
 */
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: "Invalid ID" });

    const deleted = await Staff.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ success: false, message: "Staff not found" });

    res.json({ success: true, message: "Staff deleted" });
  } catch (err: any) {
    console.error("DELETE /api/staff/:id error:", err);
    res.status(500).json({ success: false, message: "Delete failed" });
  }
});

/**
 * POST /api/staff/:id/assign-department
 * Assign staff to a department (body: { departmentId })
 */
router.post("/:id/assign-department", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { departmentId } = req.body;
    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(departmentId))
      return res.status(400).json({ success: false, message: "Invalid IDs" });

    const staff = await Staff.findById(id);
    if (!staff) return res.status(404).json({ success: false, message: "Staff not found" });

    staff.department = departmentId;
    await staff.save();
    res.json({ success: true, data: staff });
  } catch (err: any) {
    console.error("POST /api/staff/:id/assign-department error:", err);
    res.status(500).json({ success: false, message: "Assign failed" });
  }
});

/**
 * POST /api/staff/:id/schedule
 * Replace weekly schedule (body: { schedule: [{day,start,end}, ...] })
 */
router.post("/:id/schedule", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { schedule } = req.body;
    if (!Array.isArray(schedule)) return res.status(400).json({ success: false, message: "Invalid schedule" });

    const staff = await Staff.findByIdAndUpdate(id, { schedule }, { new: true });
    if (!staff) return res.status(404).json({ success: false, message: "Staff not found" });

    res.json({ success: true, data: staff });
  } catch (err: any) {
    console.error("POST /api/staff/:id/schedule error:", err);
    res.status(500).json({ success: false, message: "Update failed" });
  }
});

/**
 * POST /api/staff/:id/leave
 * Add a leave request for staff
 */
router.post("/:id/leave", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const leave = req.body;
    const staff = await Staff.findById(id);
    if (!staff) return res.status(404).json({ success: false, message: "Staff not found" });

    staff.leaves = staff.leaves || [];
    staff.leaves.push({ ...leave, status: "pending" });
    await staff.save();
    res.json({ success: true, data: staff });
  } catch (err: any) {
    console.error("POST /api/staff/:id/leave error:", err);
    res.status(500).json({ success: false, message: "Add leave failed" });
  }
});

/**
 * POST /api/staff/:id/attendance
 * Add attendance entry (body: { date, inTime, outTime, status })
 */
router.post("/:id/attendance", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const entry = req.body;
    const staff = await Staff.findById(id);
    if (!staff) return res.status(404).json({ success: false, message: "Staff not found" });

    staff.attendance = staff.attendance || [];
    staff.attendance.push(entry);
    await staff.save();
    res.json({ success: true, data: staff });
  } catch (err: any) {
    console.error("POST /api/staff/:id/attendance error:", err);
    res.status(500).json({ success: false, message: "Add attendance failed" });
  }
});

/**
 * GET /api/staff/role/:role
 * Quick list by role
 */
router.get("/role/:role", async (req: Request, res: Response) => {
  try {
    const role = req.params.role;
    const items = await Staff.find({ role }).select("name staffId role department contact");
    res.json({ success: true, data: items });
  } catch (err: any) {
    console.error("GET /api/staff/role/:role error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
