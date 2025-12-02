// // routes/settings.ts
// import express, { Request, Response } from "express";
// import mongoose from "mongoose";

// const router = express.Router();

// /**
//  * NOTE: Protect these routes with authentication + RBAC middleware in your app.
//  * Example: router.use('/api/settings', authMiddleware, adminOnly, settingsRouter)
//  */

// /* -----------------------
//    Helpers
//    ----------------------- */

// /** Get singleton settings doc, create default if missing */
// async function getSettingsDoc() {
//   let settings = await SystemSettings.findOne();
//   if (!settings) {
//     settings = new SystemSettings();
//     await settings.save();
//   }
//   return settings;
// }

// /* -----------------------
//    Settings endpoints
//    ----------------------- */

// /**
//  * GET /api/settings
//  * Returns the full settings document
//  */
// router.get("/", async (_req: Request, res: Response) => {
//   try {
//     const settings = await getSettingsDoc();
//     res.json({ success: true, data: settings });
//   } catch (err: any) {
//     console.error("GET /api/settings", err);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// });

// /**
//  * PUT /api/settings
//  * Replace full settings (be careful; admin UI should mostly use PATCH per-section)
//  */
// router.put("/", async (req: Request, res: Response) => {
//   try {
//     const payload = req.body;
//     // optional: validate payload structure
//     const settings = await getSettingsDoc();

//     // Save audit for full replace
//     await SettingsAudit.create({
//       key: "full",
//       changedBy: req.body._actorId || null,
//       changedByName: req.body._actorName || null,
//       oldValue: settings.toObject(),
//       newValue: payload,
//       reason: req.body.reason || "full replace",
//     });

//     // Overwrite fields
//     settings.general = payload.general || {};
//     settings.auth = payload.auth || {};
//     settings.billing = payload.billing || {};
//     settings.notification = payload.notification || {};
//     settings.integrations = payload.integrations || {};
//     settings.compliance = payload.compliance || {};
//     settings.features = payload.features || { features: {} };
//     settings.updatedBy = req.body._actorId || null;

//     await settings.save();
//     res.json({ success: true, data: settings });
//   } catch (err: any) {
//     console.error("PUT /api/settings", err);
//     res.status(400).json({ success: false, message: "Update failed", error: err.message });
//   }
// });

// /**
//  * PATCH /api/settings/:section
//  * Update a single section (general, auth, billing, notification, integrations, compliance, features)
//  * Body: partial section payload
//  */
// router.patch("/:section", async (req: Request, res: Response) => {
//   try {
//     const section = req.params.section;
//     const allowed = ["general", "auth", "billing", "notification", "integrations", "compliance", "features"];
//     if (!allowed.includes(section)) return res.status(400).json({ success: false, message: "Invalid section" });

//     const settings = await getSettingsDoc();
//     const oldValue = (settings as any)[section];

//     // Merge incoming partial into existing section
//     (settings as any)[section] = { ...(oldValue || {}), ...(req.body || {}) };
//     settings.updatedBy = req.body._actorId || null;

//     // Save audit
//     await SettingsAudit.create({
//       key: section,
//       changedBy: req.body._actorId || null,
//       changedByName: req.body._actorName || null,
//       oldValue,
//       newValue: (settings as any)[section],
//       reason: req.body.reason || undefined,
//     });

//     await settings.save();
//     res.json({ success: true, data: (settings as any)[section] });
//   } catch (err: any) {
//     console.error("PATCH /api/settings/:section", err);
//     res.status(400).json({ success: false, message: "Update failed", error: err.message });
//   }
// });

// /* -----------------------
//    Notification templates management
//    ----------------------- */

// /**
//  * GET /api/settings/templates
//  */
// router.get("/templates", async (_req: Request, res: Response) => {
//   try {
//     const items = await NotificationTemplate.find().sort({ name: 1 });
//     res.json({ success: true, data: items });
//   } catch (err: any) {
//     console.error("GET /api/settings/templates", err);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// });

// /**
//  * POST /api/settings/templates
//  */
// router.post("/templates", async (req: Request, res: Response) => {
//   try {
//     const { name, description, titleTemplate, bodyTemplate, channels } = req.body;
//     if (!name || !titleTemplate || !bodyTemplate) {
//       return res.status(400).json({ success: false, message: "name, titleTemplate and bodyTemplate required" });
//     }
//     const tpl = await NotificationTemplate.create({ name, description, titleTemplate, bodyTemplate, channels });
//     res.status(201).json({ success: true, data: tpl });
//   } catch (err: any) {
//     console.error("POST /api/settings/templates", err);
//     res.status(400).json({ success: false, message: "Create failed", error: err.message });
//   }
// });

// /**
//  * PUT /api/settings/templates/:id
//  */
// router.put("/templates/:id", async (req: Request, res: Response) => {
//   try {
//     const tpl = await NotificationTemplate.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
//     if (!tpl) return res.status(404).json({ success: false, message: "Template not found" });
//     res.json({ success: true, data: tpl });
//   } catch (err: any) {
//     console.error("PUT /api/settings/templates/:id", err);
//     res.status(400).json({ success: false, message: "Update failed", error: err.message });
//   }
// });

// /**
//  * DELETE /api/settings/templates/:id
//  */
// router.delete("/templates/:id", async (req: Request, res: Response) => {
//   try {
//     const tpl = await NotificationTemplate.findByIdAndDelete(req.params.id);
//     if (!tpl) return res.status(404).json({ success: false, message: "Template not found" });
//     res.json({ success: true, message: "Deleted" });
//   } catch (err: any) {
//     console.error("DELETE /api/settings/templates/:id", err);
//     res.status(500).json({ success: false, message: "Delete failed" });
//   }
// });

// /* -----------------------
//    Audit endpoints (read-only)
//    ----------------------- */

// /**
//  * GET /api/settings/audit?limit=50
//  */
// router.get("/audit", async (req: Request, res: Response) => {
//   try {
//     const limit = Math.min(parseInt((req.query.limit as string) || "50"), 500);
//     const items = await SettingsAudit.find().sort({ createdAt: -1 }).limit(limit).lean();
//     res.json({ success: true, data: items });
//   } catch (err: any) {
//     console.error("GET /api/settings/audit", err);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// });

// /* -----------------------
//    Optional: Test SMTP (validate config)
//    -----------------------
//    This endpoint does not actually send an email; it tests SMTP connection credentials.
//    NOTE: COMMENTED OUT actual nodemailer usage because some environments can't connect.
//    If you want real validation, install nodemailer and uncomment.
// */
// router.post("/test/smtp", async (req: Request, res: Response) => {
//   try {
//     const { smtpHost, smtpPort, secure, username, password } = req.body;
//     if (!smtpHost || !smtpPort) return res.status(400).json({ success: false, message: "smtpHost and smtpPort required" });

//     // Example (uncomment with nodemailer installed):
//     // import nodemailer from 'nodemailer';
//     // const transporter = nodemailer.createTransport({ host: smtpHost, port: smtpPort, secure, auth: { user: username, pass: password } });
//     // await transporter.verify();
//     // res.json({ success: true, ok: true, message: "SMTP OK" });

//     // Fallback: store config and report back (real test requires network)
//     res.json({ success: true, ok: true, message: "SMTP config accepted (network test disabled). To fully verify, enable nodemailer verify in server." });
//   } catch (err: any) {
//     console.error("POST /api/settings/test/smtp", err);
//     res.status(500).json({ success: false, message: "SMTP test failed", error: err.message });
//   }
// });

// export default router;
