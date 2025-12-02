import express, { Request, Response } from "express";
import Appointment from "../models/Appointment";
import Doctor from "../models/Doctor";
const router = express.Router();
router.post("/", async (req: Request, res: Response) => {
  try {
    const count = await Appointment.countDocuments();
    const appointmentId = `A${(count + 1).toString().padStart(3, "0")}`;
    const { doctor, patient, date, time, reason, appointmentType} = req.body;
    const appointment = await Appointment.create({
      appointmentId,
      doctor,
      patient,
      date,
      time,
      reason,
      appointmentType
    });
    res.status(201).json(appointment);
  } catch (err: any) {
    console.error("Error booking appointment:", err);
    res.status(500).json({ error: err.message });
  }
});
router.get("/", async (req: Request, res: Response) => {
  try {
    const appointments = await Appointment.find()
      .populate("patient", "fullName email contact.phone")
      .populate("doctor", "fullName email specialization consultationFee");
    res.status(200).json(appointments);
  } catch (err) {
    console.error("Error fetching appointments:", err);
    res.status(500).json({ error: "Failed to fetch appointments" });
  }
});
router.get("/patient/:patientId", async (req: Request, res: Response) => {
  try {
    const { patientId } = req.params;
    console.log(patientId, "ppppppppppppppppp");
    const appointments = await Appointment.find({
      patient: patientId,
    }).populate("doctor", "fullName department specialization consultationFee");
    res.json(appointments);
  } catch (err) {
    console.error("Error fetching patient appointments:", err);
    res.status(500).json({ error: "Failed to fetch appointments" });
  }
});
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updated = await Appointment.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    console.error("Error updating appointment:", err);
    res.status(500).json({ error: "Failed to update appointment" });
  }
});
router.get("/doctor/:doctorId", async (req, res) => {
  try {
    const { doctorId } = req.params;
    const appointments = await Appointment.find({ doctor: doctorId })
      .populate("patient", "fullName contact phone conditions")
      .sort({ date: 1, time: 1 });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch appointments" });
  }
});
router.put("/:id/status", async (req, res) => {
  try {
    const { status, notes } = req.body;
    const updated = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status, notes },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch appointments" });
  }
});
router.get("/:doctorId/patients", async (req: Request, res: Response) => {
  try {
    const { doctorId } = req.params;
    const appointments = await Appointment.find({ doctor: doctorId })
      .populate("patient")
      .lean();
    const uniquePatientsMap = new Map();
    appointments.forEach((appt) => {
      if (appt.patient && !uniquePatientsMap.has(appt.patient._id.toString())) {
        uniquePatientsMap.set(appt.patient._id.toString(), appt.patient);
      }
    });
    const patients = Array.from(uniquePatientsMap.values());
    return res.json({
      success: true,
      count: patients.length,
      patients,
    });
  } catch (err) {
    console.error("Error fetching doctor patients:", err);
    res.status(500).json({
      success: false,
      message: "Failed to load patients for doctor",
    });
  }
});
// ✅ Get all doctors consulted by a specific patient
router.get("/:patientId/doctors", async (req: Request, res: Response) => {
  try {
    const { patientId } = req.params;

    // Find all appointments for the given patient
    const appointments = await Appointment.find({ patient: patientId })
      .populate("doctor") // populate doctor info
      .lean();

    // Extract unique doctors
    const uniqueDoctorsMap = new Map();
    appointments.forEach((appt) => {
      if (appt.doctor && !uniqueDoctorsMap.has(appt.doctor._id.toString())) {
        uniqueDoctorsMap.set(appt.doctor._id.toString(), appt.doctor);
      }
    });

    const doctors = Array.from(uniqueDoctorsMap.values());

    return res.json({
      success: true,
      count: doctors.length,
      doctors,
    });
  } catch (err) {
    console.error("❌ Error fetching doctors consulted by patient:", err);
    res.status(500).json({
      success: false,
      message: "Failed to load doctors for patient",
    });
  }
});


export default router;
