import express, { Request, Response } from "express";
import mongoose, { Types } from "mongoose";
import Patient from "../models/Patient";
import User, { IUser, UserRole } from "../models/User";
import { sendMail } from "./MailRoutes";
import { patientLoginCreatedEmail } from "../models/MailModels";
const router = express.Router();
router.get("/", async (_req: Request, res: Response) => {
  try {
    const patients = await Patient.find().sort({ createdAt: -1 });
    res.json({ success: true, count: patients.length, data: patients });
  } catch (err: any) {
    console.error("GET /patients error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res
        .status(400)
        .json({ success: false, message: "Invalid patient id" });
    const patient = await Patient.findById(id);
    if (!patient)
      return res
        .status(404)
        .json({ success: false, message: "Patient not found" });
    res.json({ success: true, data: patient });
  } catch (err: any) {
    console.error("GET /patients/:id error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});
router.post("/add-patient", async (req: Request, res: Response) => {
  try {
    const {
      fullName,
      email,
      phone,
      gender,
      dob,
      bloodGroup,
      address,
      allergies,
      conditions,
      medications,
      createLogin,
    } = req.body;
    if (!fullName || !phone) {
      return res.status(400).json({
        success: false,
        message: "Full name and phone are required",
      });
    }
    const existing = await Patient.findOne({
      $or: [{ "contact.phone": phone }, { email: email?.toLowerCase() }],
    });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Patient already exists",
      });
    }
    let user: IUser | null = null;
    if (createLogin && email) {
      const existingUser = await User.findOne({
        email: email.toLowerCase(),
      });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "User already exists",
        });
      }
      user = await User.create({
        name: fullName,
        email: email.toLowerCase(),
        password: "default123",
        role: UserRole.Patient,
        verified: true,
      });
    }
    const patientId = `P${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const newPatient = await Patient.create({
      patientId,
      fullName,
      email: email?.toLowerCase(),
      dob,
      gender,
      bloodGroup,
      contact: { phone, address },
      allergies: allergies || [],
      conditions: conditions || [],
      medications: medications || [],
      userId: user?._id,
    });
    if (user) {
      user.linkedProfile = newPatient._id as Types.ObjectId;
      await user.save();
      sendMail({
        to: user.email,
        subject: "Your CareTrack Patient Account",
        html: patientLoginCreatedEmail(fullName),
      }).catch(console.error);
    }
    res.status(201).json({
      success: true,
      message: `Patient added successfully${user ? " and linked to user" : ""}`,
      data: newPatient,
    });
  } catch (err: any) {
    console.error("add-patient error:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res
        .status(400)
        .json({ success: false, message: "Invalid patient id" });
    const updated = await Patient.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated)
      return res
        .status(404)
        .json({ success: false, message: "Patient not found" });
    res.json({ success: true, data: updated });
  } catch (err: any) {
    console.error("PUT /patients/:id error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res
        .status(400)
        .json({ success: false, message: "Invalid patient id" });
    const deleted = await Patient.findByIdAndDelete(id);
    if (!deleted)
      return res
        .status(404)
        .json({ success: false, message: "Patient not found" });
    res.json({ success: true, message: "Patient deleted successfully" });
  } catch (err: any) {
    console.error("DELETE /patients/:id error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});
export default router;
