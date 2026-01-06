import { Router } from "express";
import mongoose from "mongoose";
import Appointment from "../models/Appointment";
import Prescription from "../models/drugs/Prescription";
import { prescriptionCreatedEmail } from "../models/MailModels";
import { sendMail } from "./MailRoutes";
const router = Router();
router.post("/", async (req, res) => {
  try {
    const { appointment, doctor, patient, medicines, diagnosis, advice } =
      req.body;
    if (!appointment || !doctor || !patient || !diagnosis) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const apt = await Appointment.findById(appointment)
      .populate("patient", "fullName email")
      .populate("doctor", "fullName");
    if (!apt) return res.status(404).json({ error: "Appointment not found" });
    const prescription = new Prescription({
      appointment: new mongoose.Types.ObjectId(appointment),
      doctor: new mongoose.Types.ObjectId(doctor),
      patient: new mongoose.Types.ObjectId(patient),
      medicines: medicines || [],
      diagnosis,
      advice: advice || "",
    });
    await prescription.save();
    apt.status = "Completed";
    await apt.save();
    if ((apt as any).patient?.email) {
      sendMail({
        to: (apt as any).patient.email,
        subject: "Your Prescription Is Ready",
        html: prescriptionCreatedEmail((apt as any).patient.fullName, apt.date),
      }).catch(console.error);
    }
    res.status(201).json(prescription);
  } catch (error: any) {
    console.error("Prescription create error:", error);
    res.status(500).json({ error: "Failed to create prescription" });
  }
});
router.get("/patient/:patientId", async (req, res) => {
  try {
    const { patientId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(patientId)) {
      return res.status(400).json({ error: "Invalid patient ID" });
    }
    const prescriptions = await Prescription.find({ patient: patientId })
      .populate("doctor", "fullName specialization")
      .populate("appointment", "date time reason")
      .sort({ createdAt: -1 });
    res.json(prescriptions);
  } catch {
    res.status(500).json({ error: "Failed to fetch prescriptions" });
  }
});
router.get("/doctor/:doctorId", async (req, res) => {
  try {
    const { doctorId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return res.status(400).json({ error: "Invalid doctor ID" });
    }
    const prescriptions = await Prescription.find({ doctor: doctorId })
      .populate("patient", "fullName patientId")
      .populate("appointment", "date time reason")
      .sort({ createdAt: -1 });
    res.json(prescriptions);
  } catch {
    res.status(500).json({ error: "Failed to fetch prescriptions" });
  }
});
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid prescription ID" });
    }
    const prescription = await Prescription.findById(id)
      .populate("doctor", "fullName specialization")
      .populate("patient", "fullName patientId")
      .populate("appointment", "date time reason");
    if (!prescription)
      return res.status(404).json({ error: "Prescription not found" });
    res.json(prescription);
  } catch {
    res.status(500).json({ error: "Failed to fetch prescription" });
  }
});
router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid prescription ID" });
    }
    const prescription = await Prescription.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!prescription) {
      return res.status(404).json({ error: "Prescription not found" });
    }
    res.json(prescription);
  } catch (error: any) {
    console.error("Update error:", error);
    res.status(500).json({ error: "Failed to update prescription" });
  }
});
router.get("/appointment/:appointmentId", async (req, res) => {
  try {
    const { appointmentId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
      return res.status(400).json({ error: "Invalid appointment ID" });
    }
    const prescription = await Prescription.findOne({
      appointment: appointmentId,
    })
      .populate("doctor", "fullName specialization")
      .populate("patient", "fullName patientId")
      .populate("appointment", "date time reason");
    if (!prescription)
      return res.status(404).json({ error: "Prescription not found" });
    res.json(prescription);
  } catch (error) {
    console.error("Fetch by appointment error:", error);
    res.status(500).json({ error: "Failed to fetch prescription" });
  }
});
router.get("/", async (req, res) => {
  try {
    const prescriptions = await Prescription.find()
      .populate("doctor", "fullName specialization")
      .populate("patient", "fullName patientId")
      .populate("appointment", "date time reason")
      .sort({ createdAt: -1 });
    res.json(prescriptions);
  } catch (error) {
    console.error("Fetch all prescriptions error:", error);
    res.status(500).json({ error: "Failed to fetch prescriptions" });
  }
});
export default router;
