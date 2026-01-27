import express, { Request, Response } from "express";
import Appointment, { IAppointment } from "../models/Appointment";
import { sendMail } from "./MailRoutes";
import {
  appointmentBookedPatientEmail,
  appointmentStatusEmail,
  doctorAppointmentBookedEmail,
} from "../models/MailModels";
const router = express.Router();
type PopulatedPatient = {
  _id: string;
  fullName: string;
  email?: string;
};
type PopulatedDoctor = {
  _id: string;
  fullName: string;
  email?: string;
};
type AppointmentPopulated = Omit<IAppointment, "patient" | "doctor"> & {
  patient: PopulatedPatient;
  doctor: PopulatedDoctor;
};
router.post("/", async (req: Request, res: Response) => {
  try {
    const { doctor, patient, date, time, reason, appointmentType } = req.body;
     if (!doctor || !patient) {
      return res.status(400).json({
        success: false,
        message: "Doctor and patient are required",
      });
    }
    const appointment = await Appointment.create({
      doctor,
      patient,
      date,
      time,
      reason,
      appointmentType,
      status: "Pending",
    });
    const populated = (await appointment.populate([
      { path: "patient", select: "fullName email" },
      { path: "doctor", select: "fullName email" },
    ])) as unknown as AppointmentPopulated;
    if (populated.patient?.email) {
      sendMail({
        to: populated.patient.email,
        subject: "Appointment Confirmed",
        html: appointmentBookedPatientEmail(
          populated.patient.fullName,
          populated.doctor.fullName,
          date,
          time,
          appointmentType
        ),
      }).catch(console.error);
    }
    if (populated.doctor?.email) {
      sendMail({
        to: populated.doctor.email,
        subject: "New Appointment Booked",
        html: doctorAppointmentBookedEmail(
          populated.doctor.fullName,
          date,
          time,
          appointmentType
        ),
      }).catch(console.error);
    }
    res.status(201).json(appointment);
  } catch (err: any) {
    console.error("Error booking appointment:", err);
    res.status(500).json({ error: err.message });
  }
});
router.get("/", async (_req: Request, res: Response) => {
  try {
    const appointments = await Appointment.find()
      .populate("patient", "fullName email contact.phone")
      .populate("doctor", "fullName email specialization consultationFee")
      .sort({ date: 1, time: 1 });
    res.status(200).json(appointments);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch appointments" });
  }
});
router.get("/patient/:patientId", async (req: Request, res: Response) => {
  try {
    const appointments = await Appointment.find({
      patient: req.params.patientId,
    }).populate("doctor", "fullName specialization consultationFee");
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch appointments" });
  }
});
router.get("/doctor/:doctorId", async (req: Request, res: Response) => {
  try {
    const appointments = await Appointment.find({
      doctor: req.params.doctorId,
    })
      .populate("patient", "fullName contact.phone conditions")
      .sort({ date: 1, time: 1 });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch appointments" });
  }
});
router.put("/:id/status", async (req: Request, res: Response) => {
  try {
    const { status, notes } = req.body;
    const updated = (await Appointment.findByIdAndUpdate(
      req.params.id,
      { status, notes },
      { new: true }
    ).populate("patient", "fullName email")) as unknown as AppointmentPopulated;
    if (updated?.patient?.email) {
      sendMail({
        to: updated.patient.email,
        subject: "Appointment Status Updated",
        html: appointmentStatusEmail(
          updated.patient.fullName,
          status,
          updated.date,
          updated.time
        ),
      }).catch(console.error);
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update appointment" });
  }
});
router.get("/:doctorId/patients", async (req: Request, res: Response) => {
  try {
    const appointments = await Appointment.find({
      doctor: req.params.doctorId,
    })
      .populate("patient")
      .lean();
    const uniquePatients = Array.from(
      new Map(
        appointments
          .filter((a) => a.patient)
          .map((a: any) => [a.patient._id.toString(), a.patient])
      ).values()
    );
    res.json({
      success: true,
      count: uniquePatients.length,
      patients: uniquePatients,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to load patients for doctor",
    });
  }
});
router.get("/:patientId/doctors", async (req: Request, res: Response) => {
  try {
    const appointments = await Appointment.find({
      patient: req.params.patientId,
    })
      .populate("doctor")
      .lean();
    const uniqueDoctors = Array.from(
      new Map(
        appointments
          .filter((a) => a.doctor)
          .map((a: any) => [a.doctor._id.toString(), a.doctor])
      ).values()
    );
    res.json({
      success: true,
      count: uniqueDoctors.length,
      doctors: uniqueDoctors,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to load doctors for patient",
    });
  }
});
export default router;
