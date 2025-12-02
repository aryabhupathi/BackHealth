// // routes/reports.ts
// import express, { Request, Response } from "express";

// // Import your models - adjust paths to your project
// import Patient from "../models/Patient";
// import Appointment from "../models/Appointment";// small model above
// import Bills from "../models/Bills";
// import Inventory from "../models/drugs/Inventory";
// import LabOrder from "../models/labs/LabOrder";
// import { AuditLog } from "../models/Report";

// const router = express.Router();

// /**
//  * Helper: parse date range from query
//  */
// function parseDateRange(q: any) {
//   const start = q.start ? new Date(q.start) : new Date(new Date().setDate(new Date().getDate() - 30));
//   const end = q.end ? new Date(q.end) : new Date();
//   // normalize times
//   start.setHours(0, 0, 0, 0);
//   end.setHours(23, 59, 59, 999);
//   return { start, end };
// }

// /* ============================
//    1) Patient demographics
//    ============================ */
// router.get("/patients/demographics", async (req: Request, res: Response) => {
//   try {
//     // age groups: 0-17, 18-35, 36-55, 56-75, 76+
//     const pipeline = [
//       {
//         $project: {
//           gender: 1,
//           birthDate: "$dob",
//           age: {
//             $floor: {
//               $divide: [{ $subtract: [new Date(), "$dob"] }, 1000 * 60 * 60 * 24 * 365],
//             },
//           },
//           city: "$contact.address", // assume address includes city — adapt as needed
//         },
//       },
//       {
//         $facet: {
//           byGender: [
//             { $group: { _id: "$gender", count: { $sum: 1 } } },
//             { $sort: { _id: 1 } },
//           ],
//           byAgeGroup: [
//             {
//               $bucket: {
//                 groupBy: "$age",
//                 boundaries: [0, 18, 36, 56, 76, 200],
//                 default: "unknown",
//                 output: { count: { $sum: 1 } },
//               },
//             },
//           ],
//           topCities: [
//             { $group: { _id: "$city", count: { $sum: 1 } } },
//             { $sort: { count: -1 } },
//             { $limit: 10 },
//           ],
//           total: [{ $count: "count" }],
//         },
//       },
//     ];

//     const result = await Patient.aggregate(pipeline).allowDiskUse(true);
//     res.json({ success: true, data: result[0] || {} });
//   } catch (err: any) {
//     console.error("patients/demographics", err);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// });

// /* ============================
//    2) Appointments summary
//    ============================ */
// router.get("/appointments/summary", async (req: Request, res: Response) => {
//   try {
//     const { start, end } = parseDateRange(req.query);

//     // counts by status + daily trend for range
//     const pipeline = [
//       {
//         $match: {
//           createdAt: { $gte: start, $lte: end },
//           ...(req.query.department ? { department: req.query.department } : {}),
//         },
//       },
//       {
//         $facet: {
//           byStatus: [{ $group: { _id: "$status", count: { $sum: 1 } } }],
//           trend: [
//             {
//               $group: {
//                 _id: {
//                   year: { $year: "$createdAt" },
//                   month: { $month: "$createdAt" },
//                   day: { $dayOfMonth: "$createdAt" },
//                 },
//                 count: { $sum: 1 },
//               },
//             },
//             {
//               $project: {
//                 date: {
//                   $dateFromParts: {
//                     year: "$_id.year",
//                     month: "$_id.month",
//                     day: "$_id.day",
//                   },
//                 },
//                 count: 1,
//               },
//             },
//             { $sort: { date: 1 } },
//           ],
//           total: [{ $count: "count" }],
//         },
//       },
//     ];

//     const out = await Appointment.aggregate(pipeline).allowDiskUse(true);
//     res.json({ success: true, data: out[0] || {} });
//   } catch (err: any) {
//     console.error("appointments/summary", err);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// });

// /* ============================
//    3) Admissions — avg length of stay
//    ============================ */
// router.get("/admissions/length-of-stay", async (req: Request, res: Response) => {
//   try {
//     const { start, end } = parseDateRange(req.query);

//     // assumes Admission has fields: patientId, department, admittedAt, dischargedAt
//     const pipeline = [
//       {
//         $match: {
//           admittedAt: { $gte: start, $lte: end },
//           dischargedAt: { $exists: true, $ne: null },
//         },
//       },
//       {
//         $project: {
//           department: 1,
//           losDays: {
//             $divide: [{ $subtract: ["$dischargedAt", "$admittedAt"] }, 1000 * 60 * 60 * 24],
//           },
//         },
//       },
//       {
//         $group: {
//           _id: "$department",
//           avgLOS: { $avg: "$losDays" },
//           medianLOS: { $push: "$losDays" },
//           count: { $sum: 1 },
//         },
//       },
//       {
//         $project: {
//           avgLOS: { $round: ["$avgLOS", 2] },
//           count: 1,
//         },
//       },
//       { $sort: { avgLOS: -1 } },
//     ];

//     const out = await Admission.aggregate(pipeline).allowDiskUse(true);
//     res.json({ success: true, data: out });
//   } catch (err: any) {
//     console.error("admissions/length-of-stay", err);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// });

// /* ============================
//    4) Revenue summary
//    ============================ */
// router.get("/revenue/summary", async (req: Request, res: Response) => {
//   try {
//     const { start, end } = parseDateRange(req.query);

//     // Bill model assumed fields: patientId, doctorId, items[], totalAmount, paidAmount, status, createdAt, department
//     const pipeline = [
//       {
//         $match: {
//           createdAt: { $gte: start, $lte: end },
//           // optional filters
//           ...(req.query.department ? { department: req.query.department } : {}),
//         },
//       },
//       {
//         $facet: {
//           totals: [
//             {
//               $group: {
//                 _id: null,
//                 revenue: { $sum: "$totalAmount" },
//                 paid: { $sum: "$paidAmount" },
//                 count: { $sum: 1 },
//               },
//             },
//           ],
//           byDepartment: [
//             {
//               $group: {
//                 _id: "$department",
//                 revenue: { $sum: "$totalAmount" },
//                 paid: { $sum: "$paidAmount" },
//                 count: { $sum: 1 },
//               },
//             },
//             { $sort: { revenue: -1 } },
//             { $limit: 20 },
//           ],
//           daily: [
//             {
//               $group: {
//                 _id: { day: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } } },
//                 revenue: { $sum: "$totalAmount" },
//                 paid: { $sum: "$paidAmount" },
//               },
//             },
//             { $sort: { "_id.day": 1 } },
//           ],
//         },
//       },
//     ];

//     const out = await Bills.aggregate(pipeline).allowDiskUse(true);
//     res.json({ success: true, data: out[0] || {} });
//   } catch (err: any) {
//     console.error("revenue/summary", err);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// });

// /* ============================
//    5) Inventory / Pharmacy analytics
//    ============================ */
// router.get("/inventory/stock", async (_req: Request, res: Response) => {
//   try {
//     // low stock threshold can be passed via ?threshold=10
//     const threshold = parseInt((_req.query.threshold as string) || "10");

//     const pipeline = [
//       {
//         $facet: {
//           lowStock: [{ $match: { quantity: { $lte: threshold } } }, { $sort: { quantity: 1 } }],
//           expiringSoon: [
//             {
//               $match: {
//                 expiryDate: { $exists: true, $ne: null, $lte: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 30) },
//               },
//             },
//             { $sort: { expiryDate: 1 } },
//           ],
//           totals: [
//             { $group: { _id: null, totalItems: { $sum: "$quantity" }, count: { $sum: 1 } } },
//           ],
//         },
//       },
//     ];

//     const out = await Inventory.aggregate(pipeline).allowDiskUse(true);
//     res.json({ success: true, data: out[0] || {} });
//   } catch (err: any) {
//     console.error("inventory/stock", err);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// });

// /* ============================
//    6) Lab analytics — TAT & most ordered
//    ============================ */
// router.get("/labs/tat", async (req: Request, res: Response) => {
//   try {
//     // LabOrder fields: createdAt (ordered), completedAt or LabResult.createdAt (result)
//     const { start, end } = parseDateRange(req.query);

//     const pipeline = [
//       { $match: { createdAt: { $gte: start, $lte: end } } },
//       {
//         $lookup: {
//           from: "labresults",
//           localField: "_id",
//           foreignField: "orderId",
//           as: "results",
//         },
//       },
//       {
//         $unwind: {
//           path: "$results",
//           preserveNullAndEmptyArrays: true,
//         },
//       },
//       {
//         $project: {
//           testId: "$tests.testId",
//           orderedAt: "$createdAt",
//           resultAt: "$results.createdAt",
//           tatHours: {
//             $cond: [
//               { $and: ["$results.createdAt", "$createdAt"] },
//               {
//                 $divide: [{ $subtract: ["$results.createdAt", "$createdAt"] }, 1000 * 60 * 60],
//               },
//               null,
//             ],
//           },
//         },
//       },
//       {
//         $group: {
//           _id: null,
//           avgTATHours: { $avg: "$tatHours" },
//           medianTAT: { $push: "$tatHours" },
//           completedCount: { $sum: { $cond: [{ $ifNull: ["$tatHours", false] }, 1, 0] } },
//         },
//       },
//     ];

//     const out = await LabOrder.aggregate(pipeline).allowDiskUse(true);
//     res.json({ success: true, data: out[0] || {} });
//   } catch (err: any) {
//     console.error("labs/tat", err);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// });

// /* ============================
//    7) Staff utilization (basic)
//    ============================ */
// router.get("/staff/utilization", async (req: Request, res: Response) => {
//   try {
//     const { start, end } = parseDateRange(req.query);

//     // Patients handled per doctor (via appointments or admissions)
//     const apptPipeline = [
//       {
//         $match: {
//           createdAt: { $gte: start, $lte: end },
//           status: "completed",
//         },
//       },
//       {
//         $group: {
//           _id: "$doctorId",
//           appointments: { $sum: 1 },
//         },
//       },
//       {
//         $lookup: {
//           from: "staffs",
//           localField: "_id",
//           foreignField: "_id",
//           as: "staff",
//         },
//       },
//       { $unwind: "$staff" },
//       {
//         $project: {
//           staffId: "$staff._id",
//           name: "$staff.name",
//           role: "$staff.role",
//           department: "$staff.department",
//           appointments: 1,
//         },
//       },
//       { $sort: { appointments: -1 } },
//       { $limit: 100 },
//     ];

//     const apptStats = await Appointment.aggregate(apptPipeline).allowDiskUse(true);

//     res.json({ success: true, data: { appointmentsPerDoctor: apptStats } });
//   } catch (err: any) {
//     console.error("staff/utilization", err);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// });

// /* ============================
//    8) Audit log (recent)
//    ============================ */
// router.get("/audit/recent", async (req: Request, res: Response) => {
//   try {
//     const limit = parseInt((req.query.limit as string) || "50");
//     const items = await AuditLog.find().sort({ createdAt: -1 }).limit(limit).lean();
//     res.json({ success: true, data: items });
//   } catch (err: any) {
//     console.error("audit/recent", err);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// });

// export default router;
