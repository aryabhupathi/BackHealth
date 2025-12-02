// routes/departmentRoutes.ts
import express, { Request, Response } from "express";
import Department from "../models/Department";

const router = express.Router();

// 📌 Get all departments (with pagination + optional search)
router.get("/", async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [departments, total] = await Promise.all([
      Department.find()
        .populate("headOfDepartment", "name email role")
        .populate("staff", "name email role")
        .skip(skip)
        .limit(limit),
      Department.countDocuments(),
    ]);

    res.json({
      success: true,
      data: departments,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit,
      },
    });
  } catch (err: any) {
    console.error("Error fetching departments:", err.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// 📌 Get single department by ID
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const department = await Department.findById(req.params.id)
      .populate("headOfDepartment", "name email role")
      .populate("staff", "name email role");

    if (!department)
      return res.status(404).json({ success: false, message: "Department not found" });

    res.json({ success: true, data: department });
  } catch (err: any) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// 📌 Create department
router.post("/", async (req: Request, res: Response) => {
  try {
    const department = await Department.create(req.body);
    res.status(201).json({ success: true, data: department });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: "Invalid data",
      error: err.message,
    });
  }
});

// 📌 Update department
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const department = await Department.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!department)
      return res.status(404).json({ success: false, message: "Department not found" });

    res.json({ success: true, data: department });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: "Update failed",
      error: err.message,
    });
  }
});

// 📌 Delete department
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const department = await Department.findByIdAndDelete(req.params.id);

    if (!department)
      return res.status(404).json({ success: false, message: "Department not found" });

    res.json({ success: true, message: "Department deleted" });
  } catch (err: any) {
    res.status(500).json({ success: false, message: "Delete failed" });
  }
});

export default router;
