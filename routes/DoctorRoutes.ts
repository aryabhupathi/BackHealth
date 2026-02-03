import express, { Request, Response } from "express";
import Doctor from "../models/Doctor";
import Appointment from "../models/Appointment";
import User, { UserRole } from "../models/User";
import { sendMail } from "./MailRoutes";
import {
  doctorAccountCreatedEmail,
  doctorAppointmentBookedEmail,
} from "../models/MailModels";
const router = express.Router();
async function getNextDoctorId(): Promise<string> {
  const lastDoctor = await Doctor.findOne().sort({ createdAt: -1 }).exec();
  let nextIdNum = 1;
  if (lastDoctor && lastDoctor.doctorId) {
    const match = lastDoctor.doctorId.match(/DOC(\d+)/);
    if (match) nextIdNum = parseInt(match[1]) + 1;
  }
  return `DOC${nextIdNum.toString().padStart(5, "0")}`;
}
router.post("/", async (req: Request, res: Response) => {
  try {
    const body: any = req.body;
    body.doctorId = await getNextDoctorId();
    const namePart = (body.fullName || "doctor")
      .toLowerCase()
      .replace(/\s+/g, "")
      .slice(0, 8);
    body.email = `${namePart}@hospital.com`;
    if (!body.specialization?.length)
      body.specialization = ["General Medicine"];
    if (!body.workingHours?.length) {
      body.workingHours = [
        {
          day: "Monday",
          startTime: "09:00",
          endTime: "17:00",
          isAvailable: true,
        },
      ];
    }
    const doctor = new Doctor(body);
    await doctor.save();
    const user = new User({
      name: doctor.fullName,
      email: doctor.email,
      password: "Doctor@123",
      role: UserRole.Doctor,
      linkedProfile: doctor._id,
    });
    await user.save();
    sendMail({
      to: user.email,
      subject: "Your CareTrack Doctor Account",
      html: doctorAccountCreatedEmail(doctor.fullName, doctor.email),
    }).catch(console.error);
    res.status(201).json({ message: "Doctor created successfully", doctor });
  } catch (err: any) {
    console.error("Error adding doctor:", err.message);
    res.status(400).json({ error: err.message });
  }
});
// router.get("/:id/availability", async (req: Request, res: Response) => {
//   try {
//     const doctorId = req.params.id;
//     const doctor = await Doctor.findById(doctorId);
//     if (!doctor) return res.status(404).json({ message: "Doctor not found" });
//     // const appointments = await Appointment.find({ doctorId: doctor._id });
//     const appointments = await Appointment.find({
//   doctor: doctor._id,
// });

//     const availableSlots: { date: string; times: string[] }[] = [];
//     const today = new Date();
//     const workingHours = Array.isArray(doctor.workingHours)
//       ? doctor.workingHours
//       : [];
//     for (let i = 0; i < 30; i++) {
//       const currentDate = new Date(today);
//       currentDate.setDate(today.getDate() + i);
//       const weekday = currentDate.toLocaleDateString("en-US", {
//         weekday: "long",
//       });
//       const daySchedule = workingHours.find(
//         (w: any) => w.day === weekday && w.isAvailable
//       );
//       if (!daySchedule) continue;
//       const [startHour, startMin] = daySchedule.startTime
//         .split(":")
//         .map(Number);
//       const [endHour, endMin] = daySchedule.endTime.split(":").map(Number);
//       const times: string[] = [];
//       let currentHour = startHour;
//       let currentMinute = startMin;
//       while (
//         currentHour < endHour ||
//         (currentHour === endHour && currentMinute < endMin)
//       ) {
//         const timeLabel = `${currentHour
//           .toString()
//           .padStart(2, "0")}:${currentMinute.toString().padStart(2, "0")}`;
//         times.push(timeLabel);
//         currentMinute += 30;
//         if (currentMinute >= 60) {
//           currentMinute = 0;
//           currentHour++;
//         }
//       }
//       const dateStr = currentDate.toISOString().split("T")[0];
//       const bookedTimes = appointments
//         .filter((a) => a.date === dateStr)
//         .map((a) => a.time);
//       const availableTimes = times.filter((t) => !bookedTimes.includes(t));
//       availableSlots.push({ date: dateStr, times: availableTimes });
//     }
//     res.json({ availableSlots });
//   } catch (err) {
//     console.error("Error fetching doctor availability:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// });

router.get("/:id/availability", async (req: Request, res: Response) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    const appointments = await Appointment.find({
      doctor: doctor._id,
    });

    // Build booked slots map
    const bookedMap = new Map<string, Set<string>>();
    for (const appt of appointments) {
      const dateKey = appt.date.toISOString().slice(0, 10); // YYYY-MM-DD
      if (!bookedMap.has(dateKey)) {
        bookedMap.set(dateKey, new Set());
      }
      bookedMap.get(dateKey)!.add(appt.time);
    }

    const availableSlots: { date: string; times: string[] }[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0); // normalize

    for (let i = 0; i < 30; i++) {
      const currentDate = new Date(today);
      currentDate.setDate(today.getDate() + i);

      const weekday = currentDate.toLocaleDateString("en-US", {
        weekday: "long",
      });

      const daySchedule = doctor.workingHours?.find(
        (w: any) => w.day === weekday && w.isAvailable
      );

      if (!daySchedule) continue;

      const [startHour, startMin] = daySchedule.startTime
        .split(":")
        .map(Number);
      const [endHour, endMin] = daySchedule.endTime
        .split(":")
        .map(Number);

      const times: string[] = [];
      let h = startHour;
      let m = startMin;

      while (h < endHour || (h === endHour && m < endMin)) {
        times.push(
          `${h.toString().padStart(2, "0")}:${m
            .toString()
            .padStart(2, "0")}`
        );
        m += 30;
        if (m >= 60) {
          m = 0;
          h++;
        }
      }

      const dateKey = currentDate.toISOString().slice(0, 10);
      const bookedTimes = bookedMap.get(dateKey) ?? new Set();

      const availableTimes = times.filter(
        (t) => !bookedTimes.has(t)
      );

      if (availableTimes.length) {
        availableSlots.push({
          date: dateKey,
          times: availableTimes,
        });
      }
    }

    res.json({ availableSlots });
  } catch (err) {
    console.error("Error fetching doctor availability:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/", async (req: Request, res: Response) => {
  try {
    const { department, specialization, search } = req.query;
    const filter: any = {};
    if (department) filter.department = department;
    if (specialization) filter.specialization = specialization;
    if (search) {
      const regex = { $regex: search as string, $options: "i" };
      filter.$or = [
        { fullName: regex },
        { department: regex },
        { specialization: regex },
        { "contact.email": regex },
      ];
    }
    const doctors = await Doctor.find(filter).sort({ createdAt: -1 });
    res.json(doctors);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const updatedDoctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedDoctor)
      return res.status(404).json({ message: "Doctor not found" });
    res.json(updatedDoctor);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const doctor = await Doctor.findByIdAndDelete(req.params.id);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    res.json({ message: "Doctor deleted successfully" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
router.post("/:id/book", async (req: Request, res: Response) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    const { patientId, date, time, mode, reason } = req.body;
    if (!patientId || !date || !time)
      return res.status(400).json({ message: "Missing required fields" });
    const appointment = new Appointment({
      doctorId: doctor._id,
      patientId,
      date,
      time,
      mode,
      reason,
      status: "pending",
    });
    await appointment.save();
    sendMail({
      to: doctor.email,
      subject: "New Appointment Booked",
      html: doctorAppointmentBookedEmail(
        doctor.fullName,
        date,
        time,
        mode || "In-person"
      ),
    }).catch(console.error);
    res
      .status(201)
      .json({ message: "Appointment booked successfully", appointment });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});
export default router;
