// // import express, { Request, Response } from "express";
// // import Doctor from "../models/Doctor";
// // import Appointment from "../models/Appointment";
// // import User, { UserRole } from "../models/User";
// // const router = express.Router();
// // async function getNextDoctorId(): Promise<string> {
// //   const lastDoctor = await Doctor.findOne().sort({ createdAt: -1 }).exec();
// //   let nextIdNum = 1;
// //   if (lastDoctor && lastDoctor.doctorId) {
// //     const match = lastDoctor.doctorId.match(/DOC(\d+)/);
// //     if (match) nextIdNum = parseInt(match[1]) + 1;
// //   }
// //   return `DOC${nextIdNum.toString().padStart(5, "0")}`;
// // }
// // router.post("/", async (req: Request, res: Response) => {
// //   try {
// //     const body: any = req.body;
// //     body.doctorId = await getNextDoctorId();
// //     const namePart = (body.fullName || "doctor")
// //       .toLowerCase()
// //       .replace(/\s+/g, "")
// //       .slice(0, 8);
// //     body.email = `${namePart}@hospital.com`;
// //     body.contact = body.contact || {};
// //     if (!body.contact.email && req.body.contact?.email) {
// //       body.contact.email = req.body.contact.email;
// //     }
// //     if (!body.specialization || body.specialization.length === 0) {
// //       body.specialization = ["General Medicine"];
// //     }
// //     if (!body.workingHours || body.workingHours.length === 0) {
// //       body.workingHours = [
// //         {
// //           day: "Monday",
// //           startTime: "09:00",
// //           endTime: "17:00",
// //           isAvailable: true,
// //         },
// //       ];
// //     }
// //     if (!body.consultationFee) {
// //       body.consultationFee = { inPerson: 0, online: 0, currency: "INR" };
// //     }
// //     if (!body.licenseNumber) {
// //       body.licenseNumber = `LIC-${Date.now().toString(36)}-${Math.floor(
// //         Math.random() * 1000
// //       )}`;
// //     }
// //     const doctor = new Doctor(body);
// //     await doctor.save();
// //     const defaultPassword = "Doctor@123";
// //     const user = new User({
// //       name: doctor.fullName,
// //       email: doctor.email,
// //       password: defaultPassword,
// //       role: UserRole.Doctor,
// //       linkedProfile: doctor._id,
// //     });
// //     await user.save();
// //     res
// //       .status(201)
// //       .json({ message: "Doctor and user created successfully", doctor, user });
// //   } catch (err: any) {
// //     console.error("Error adding doctor:", err.message);
// //     res.status(400).json({ error: err.message });
// //   }
// // });
// // router.get("/", async (req: Request, res: Response) => {
// //   try {
// //     const { department, specialization, search } =
// //       req.query;
// //     const filter: any = {};
// //     if (department) filter.department = department;
// //     if (specialization) filter.specialization = specialization;
// //     if (search) {
// //       const regex = { $regex: search as string, $options: "i" };
// //       filter.$or = [
// //         { fullName: regex },
// //         { department: regex },
// //         { specialization: regex },
// //         { "contact.email": regex },
// //       ];
// //     }
// //     const doctors = await Doctor.find(filter).sort({ createdAt: -1 });
// //     res.json(doctors);
// //   } catch (err: any) {
// //     res.status(500).json({ error: err.message });
// //   }
// // });
// // router.get("/:id/availability", async (req, res) => {
// //   try {
// //     const doctorId = req.params.id;

// //     // Check if doctor exists
// //     const doctor = await Doctor.findById(doctorId);
// //     if (!doctor) {
// //       return res.status(404).json({ message: "Doctor not found" });
// //     }

// //     // Get all existing appointments for this doctor
// //     const appointments = await Appointment.find({ doctor: doctorId });

// //     // Example schedule setup — you can replace this with DB-stored working hours
// //     const workingHours = {
// //       start: 9, // 9 AM
// //       end: 17,  // 5 PM
// //       slotDuration: 30, // minutes
// //     };

// //     // Generate available slots for next 7 days
// //     const availableSlots = [];
// //     const today = new Date();

// //     for (let i = 0; i < 7; i++) {
// //       const currentDate = new Date(today);
// //       currentDate.setDate(today.getDate() + i);
// //       const dateStr = currentDate.toISOString().split("T")[0];

// //       const times = [];
// //       for (let hour = workingHours.start; hour < workingHours.end; hour++) {
// //         for (
// //           let minute = 0;
// //           minute < 60;
// //           minute += workingHours.slotDuration
// //         ) {
// //           const timeLabel = `${hour.toString().padStart(2, "0")}:${minute
// //             .toString()
// //             .padStart(2, "0")}`;
// //           times.push(timeLabel);
// //         }
// //       }

// //       // Remove booked times for this date
// //       const bookedTimes = appointments
// //         .filter((a) => a.date === dateStr)
// //         .map((a) => a.time);

// //       const availableTimes = times.filter((t) => !bookedTimes.includes(t));

// //       availableSlots.push({
// //         date: dateStr,
// //         times: availableTimes,
// //       });
// //     }

// //     console.log(availableSlots, "aaaaaaaaaaaaaaaaaaaa")
// //     res.json({ availableSlots });
// //   } catch (err) {
// //     console.error("Error fetching doctor availability:", err);
// //     res.status(500).json({ message: "Server error", });
// //   }
// // });
// // router.get("/:id", async (req: Request, res: Response) => {
// //   try {
// //     const doctor = await Doctor.findById(req.params.id);
// //     if (!doctor) return res.status(404).json({ message: "Doctor not found" });
// //     res.json(doctor);
// //   } catch (err: any) {
// //     res.status(500).json({ error: err.message });
// //   }
// // });
// // router.put("/:id", async (req: Request, res: Response) => {
// //   try {
// //     const updatedDoctor = await Doctor.findByIdAndUpdate(
// //       req.params.id,
// //       req.body,
// //       {
// //         new: true,
// //         runValidators: true,
// //       }
// //     );
// //     if (!updatedDoctor)
// //       return res.status(404).json({ message: "Doctor not found" });
// //     res.json(updatedDoctor);
// //   } catch (err: any) {
// //     res.status(400).json({ error: err.message });
// //   }
// // });
// // router.delete("/:id", async (req: Request, res: Response) => {
// //   try {
// //     const doctor = await Doctor.findByIdAndDelete(req.params.id);
// //     if (!doctor) return res.status(404).json({ message: "Doctor not found" });
// //     res.json({ message: "Doctor deleted successfully" });
// //   } catch (err: any) {
// //     res.status(500).json({ error: err.message });
// //   }
// // });
// // router.post("/:id/book", async (req: Request, res: Response) => {
// //   try {
// //     const doctor = await Doctor.findById(req.params.id);
// //     if (!doctor) return res.status(404).json({ message: "Doctor not found" });
// //     const { patientId, date, time, mode, reason } = req.body;
// //     if (!patientId || !date || !time)
// //       return res.status(400).json({ message: "Missing required fields" });
// //     const appointment = new Appointment({
// //       doctorId: doctor._id,
// //       patientId,
// //       date,
// //       time,
// //       mode,
// //       reason,
// //       status: "pending",
// //     });
// //     await appointment.save();
// //     res
// //       .status(201)
// //       .json({ message: "Appointment booked successfully", appointment });
// //   } catch (err: any) {
// //     res.status(400).json({ error: err.message });
// //   }
// // });

// // export default router;

import express, { Request, Response } from "express";
import Doctor from "../models/Doctor";
import Appointment from "../models/Appointment";
import User, { UserRole } from "../models/User";

const router = express.Router();

// Generate next doctor ID
async function getNextDoctorId(): Promise<string> {
  const lastDoctor = await Doctor.findOne().sort({ createdAt: -1 }).exec();
  let nextIdNum = 1;
  if (lastDoctor && lastDoctor.doctorId) {
    const match = lastDoctor.doctorId.match(/DOC(\d+)/);
    if (match) nextIdNum = parseInt(match[1]) + 1;
  }
  return `DOC${nextIdNum.toString().padStart(5, "0")}`;
}

// 🧩 Create Doctor
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

    res.status(201).json({ message: "Doctor created successfully", doctor });
  } catch (err: any) {
    console.error("Error adding doctor:", err.message);
    res.status(400).json({ error: err.message });
  }
});

// 🕓 Doctor availability route — must come BEFORE /:id
router.get("/:id/availability", async (req: Request, res: Response) => {
  try {
    const doctorId = req.params.id;
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    const appointments = await Appointment.find({ doctorId: doctor._id });

    const availableSlots: { date: string; times: string[] }[] = [];
    const today = new Date();

    // Ensure workingHours is an array
    const workingHours = Array.isArray(doctor.workingHours)
      ? doctor.workingHours
      : [];

    // Generate next 7 days
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(today);
      currentDate.setDate(today.getDate() + i);

      const weekday = currentDate.toLocaleDateString("en-US", {
        weekday: "long",
      });

      // Find matching schedule for this day
      const daySchedule = workingHours.find(
        (w: any) => w.day === weekday && w.isAvailable
      );

      // Skip if no working hours for this day
      if (!daySchedule) continue;

      const [startHour, startMin] = daySchedule.startTime.split(":").map(Number);
      const [endHour, endMin] = daySchedule.endTime.split(":").map(Number);

      const times: string[] = [];
      let currentHour = startHour;
      let currentMinute = startMin;

      while (
        currentHour < endHour ||
        (currentHour === endHour && currentMinute < endMin)
      ) {
        const timeLabel = `${currentHour.toString().padStart(2, "0")}:${currentMinute
          .toString()
          .padStart(2, "0")}`;
        times.push(timeLabel);

        currentMinute += 30;
        if (currentMinute >= 60) {
          currentMinute = 0;
          currentHour++;
        }
      }

      const dateStr = currentDate.toISOString().split("T")[0];

      // Remove booked times for this date
      const bookedTimes = appointments
        .filter((a) => a.date === dateStr)
        .map((a) => a.time);

      const availableTimes = times.filter((t) => !bookedTimes.includes(t));

      availableSlots.push({ date: dateStr, times: availableTimes });
    }

    res.json({ availableSlots });
  } catch (err) {
    console.error("Error fetching doctor availability:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// 🩺 Get all doctors
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

// // 🩺 Get doctor by ID
// router.get("/:id", async (req: Request, res: Response) => {
//   try {
//     const doctor = await Doctor.findById(req.params.id);
//     if (!doctor) return res.status(404).json({ message: "Doctor not found" });
//     res.json(doctor);
//   } catch (err: any) {
//     res.status(500).json({ error: err.message });
//   }
// });

// ✏️ Update doctor
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

// ❌ Delete doctor
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const doctor = await Doctor.findByIdAndDelete(req.params.id);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    res.json({ message: "Doctor deleted successfully" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 📅 Book appointment
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
    res
      .status(201)
      .json({ message: "Appointment booked successfully", appointment });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
