// import express, { Request, Response } from "express";
// const router = express.Router();

// /**
//  * NOTE: add your auth middleware in your app (e.g., router.use(auth))
//  * and ensure req.user contains authenticated user id and role.
//  */

// /* ---------------------------
//    MESSAGE THREADS & MESSAGES
//    Routes:
//    - GET /messages?userId=&page=&limit=  -> list threads for user (inbox)
//    - GET /messages/thread/:threadId      -> get thread + messages
//    - POST /messages/thread               -> create thread (participants + optional initial message)
//    - POST /messages/thread/:threadId     -> post a message to thread
//    - PUT /messages/thread/:threadId/read -> mark messages as read for a user
//    - DELETE /messages/thread/:threadId   -> delete/close thread (soft-delete ideally)
// --------------------------- */

// /**
//  * GET /messages
//  * List threads for the current user (inbox)
//  * query:
//  *   page, limit, q (search)
//  */
// router.get("/messages", async (req: Request, res: Response) => {
//   try {
//     // replace with req.user.id from your auth middleware
//     const userId = req.query.userId as string; // fallback for testing
//     if (!userId) return res.status(400).json({ success: false, message: "userId required" });

//     const page = Math.max(parseInt((req.query.page as string) || "1"), 1);
//     const limit = Math.max(parseInt((req.query.limit as string) || "20"), 1);
//     const skip = (page - 1) * limit;

//     // threads where participants include the user
//     const filter = { "participants.userId": new mongoose.Types.ObjectId(userId) };

//     const [items, total] = await Promise.all([
//       Thread.find(filter)
//         .sort({ lastMessageAt: -1, updatedAt: -1 })
//         .skip(skip)
//         .limit(limit)
//         .lean(),
//       Thread.countDocuments(filter),
//     ]);

//     res.json({ success: true, data: items, pagination: { total, page, pages: Math.ceil(total / limit) } });
//   } catch (err: any) {
//     console.error("GET /messages error:", err);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// });

// /**
//  * POST /messages/thread
//  * Create a new thread
//  * body: { title?, participants: [{ userId, model }], initialMessage?: { senderId, content } }
//  */
// router.post("/messages/thread", async (req: Request, res: Response) => {
//   try {
//     const { title, participants, initialMessage, department } = req.body;
//     if (!participants || !Array.isArray(participants) || participants.length < 2) {
//       return res.status(400).json({ success: false, message: "At least 2 participants required" });
//     }

//     const thread = new Thread({
//       title,
//       participants,
//       department,
//       messages: initialMessage ? [initialMessage] : [],
//       lastMessageAt: initialMessage ? new Date() : null,
//     });

//     await thread.save();
//     res.status(201).json({ success: true, data: thread });
//   } catch (err: any) {
//     console.error("POST /messages/thread error:", err);
//     res.status(400).json({ success: false, message: "Create thread failed", error: err.message });
//   }
// });

// /**
//  * GET /messages/thread/:threadId
//  * Get thread details + messages (paginated)
//  * query: page, limit
//  */
// router.get("/messages/thread/:threadId", async (req: Request, res: Response) => {
//   try {
//     const { threadId } = req.params;
//     const page = Math.max(parseInt((req.query.page as string) || "1"), 1);
//     const limit = Math.max(parseInt((req.query.limit as string) || "50"), 1);
//     const skip = (page - 1) * limit;

//     const thread = await Thread.findById(threadId).lean();
//     if (!thread) return res.status(404).json({ success: false, message: "Thread not found" });

//     // messages pagination implemented in app layer (slice)
//     const messages = thread.messages || [];
//     const paginated = messages.slice(Math.max(messages.length - skip - limit, 0), Math.max(messages.length - skip, 0));

//     res.json({
//       success: true,
//       data: { ...thread, messages: paginated },
//       pagination: { totalMessages: messages.length, page, pages: Math.ceil(messages.length / limit) },
//     });
//   } catch (err: any) {
//     console.error("GET /messages/thread/:id error:", err);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// });

// /**
//  * POST /messages/thread/:threadId
//  * Add message to thread
//  * body: { senderId, content, attachments? }
//  */
// router.post("/messages/thread/:threadId", async (req: Request, res: Response) => {
//   try {
//     const { threadId } = req.params;
//     const { senderId, senderName, content, attachments } = req.body;
//     if (!senderId || !content) return res.status(400).json({ success: false, message: "senderId and content required" });

//     const thread = await Thread.findById(threadId);
//     if (!thread) return res.status(404).json({ success: false, message: "Thread not found" });

//     const msg: IMessage = { senderId: new mongoose.Types.ObjectId(senderId), senderName, content, attachments: attachments || [], readBy: [] };
//     thread.messages.push(msg);
//     thread.lastMessageAt = new Date();
//     await thread.save();

//     // Optionally create in-app notification for other participants (not implemented here)
//     // e.g., create Notification documents for participants excluding sender

//     res.status(201).json({ success: true, data: msg });
//   } catch (err: any) {
//     console.error("POST /messages/thread/:id error:", err);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// });

// /**
//  * PUT /messages/thread/:threadId/read
//  * Mark messages as read for a user
//  * body: { userId }
//  */
// router.put("/messages/thread/:threadId/read", async (req: Request, res: Response) => {
//   try {
//     const { threadId } = req.params;
//     const { userId } = req.body;
//     if (!userId) return res.status(400).json({ success: false, message: "userId required" });

//     const thread = await Thread.findById(threadId);
//     if (!thread) return res.status(404).json({ success: false, message: "Thread not found" });

//     thread.messages.forEach((m) => {
//       const already = (m.readBy || []).some((id) => id.equals(userId));
//       if (!already) m.readBy = [...(m.readBy || []), new mongoose.Types.ObjectId(userId)];
//     });

//     await thread.save();
//     res.json({ success: true, message: "Marked as read" });
//   } catch (err: any) {
//     console.error("PUT /messages/read error:", err);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// });

// /**
//  * DELETE /messages/thread/:threadId
//  * Soft-delete recommended — we provide hard-delete option
//  */
// router.delete("/messages/thread/:threadId", async (req: Request, res: Response) => {
//   try {
//     const { threadId } = req.params;
//     await Thread.findByIdAndDelete(threadId);
//     res.json({ success: true, message: "Thread deleted" });
//   } catch (err: any) {
//     console.error("DELETE /messages/thread error:", err);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// });

// /* ---------------------------
//    NOTIFICATIONS
//    Routes:
//    - POST /notifications           -> create + schedule/send
//    - GET /notifications            -> list (filter by audience/user)
//    - GET /notifications/:id        -> get notification + deliveries
//    - PUT /notifications/:id/ack    -> mark delivery as read/acknowledged
//    - POST /notifications/send-now  -> force-send (useful for scheduled)
//    - POST /templates               -> create template
// --------------------------- */

// /**
//  * Helper: resolve audience to user ids
//  * NOTE: in production this should be optimized and may require querying Staff/Patient collections.
//  * For brevity, a simplified approach is used — the route callers can pass explicit `audience.users`.
//  */
// async function resolveAudience(audience: any): Promise<mongoose.Types.ObjectId[]> {
//   const ids: mongoose.Types.ObjectId[] = [];

//   if (!audience) return ids;

//   if (audience.all) {
//     // do NOT actually return all user ids here; caller should set explicit users
//     // For demo, return empty and let downstream sender handle 'all' differently
//     return ids;
//   }

//   if (Array.isArray(audience.users) && audience.users.length) {
//     for (const u of audience.users) ids.push(new mongoose.Types.ObjectId(u));
//   }

//   // roles/departments lookup omitted — implement as needed by querying Staff model
//   return ids;
// }

// /**
//  * POST /notifications
//  * Create notification; if scheduledFor is null => immediate (but actual sending handled by a sender process)
//  * body: { title, body, meta, audience, channels, priority, scheduledFor }
//  */
// router.post("/notifications", async (req: Request, res: Response) => {
//   try {
//     const { title, body, meta, audience, channels, priority, scheduledFor } = req.body;
//     if (!title || !body || !channels || channels.length === 0) {
//       return res.status(400).json({ success: false, message: "title, body and channels required" });
//     }

//     const notif = new Notification({
//       title,
//       body,
//       meta,
//       audience,
//       channels,
//       priority: priority || "normal",
//       scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
//       deliveries: [],
//       createdBy: req.body.createdBy || null,
//     });

//     // If audience.users provided, pre-populate deliveries as pending for in_app channel
//     const resolvedUserIds = await resolveAudience(audience);
//     if (resolvedUserIds.length > 0) {
//       for (const uid of resolvedUserIds) {
//         for (const ch of channels) {
//           notif.deliveries.push({ to: uid, channel: ch, status: ch === "in_app" ? "pending" : "pending" });
//         }
//       }
//     }

//     await notif.save();

//     // If not scheduled -> (1) push to in-app immediately, (2) push to external channels via job worker
//     // We DO NOT perform external sends in this route — hand off to job worker or background processor.
//     // If scheduledFor is null and you want immediate in-app visibility, nothing else is required — clients poll /api/notifications?userId=...

//     res.status(201).json({ success: true, data: notif });
//   } catch (err: any) {
//     console.error("POST /notifications error:", err);
//     res.status(400).json({ success: false, message: "Create failed", error: err.message });
//   }
// });

// /**
//  * GET /notifications
//  * Query notifications relevant to a user (in-app inbox)
//  * Query: userId, page, limit, unreadOnly
//  */
// router.get("/notifications", async (req: Request, res: Response) => {
//   try {
//     const userId = req.query.userId as string;
//     if (!userId) return res.status(400).json({ success: false, message: "userId required" });

//     const page = Math.max(parseInt((req.query.page as string) || "1"), 1);
//     const limit = Math.max(parseInt((req.query.limit as string) || "20"), 1);
//     const skip = (page - 1) * limit;

//     // find notifications where deliveries include to=userId OR audience.all true OR audience.users includes userId OR roles/departments match (not implemented here)
//     // For performance, it is recommended to materialize per-user deliveries in Notification.deliveries (as we pre-populated)
//     const filter: any = {
//       $or: [
//         { "deliveries.to": new mongoose.Types.ObjectId(userId) },
//         { "audience.users": new mongoose.Types.ObjectId(userId) },
//         { "audience.all": true },
//       ],
//     };

//     if (req.query.unreadOnly === "true") {
//       filter["deliveries.status"] = { $ne: "read" };
//     }

//     const [items, total] = await Promise.all([
//       Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
//       Notification.countDocuments(filter),
//     ]);

//     res.json({ success: true, data: items, pagination: { total, page, pages: Math.ceil(total / limit) } });
//   } catch (err: any) {
//     console.error("GET /notifications error:", err);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// });

// /**
//  * GET /notifications/:id
//  */
// router.get("/notifications/:id", async (req: Request, res: Response) => {
//   try {
//     const notif = await Notification.findById(req.params.id).lean();
//     if (!notif) return res.status(404).json({ success: false, message: "Not found" });
//     res.json({ success: true, data: notif });
//   } catch (err: any) {
//     console.error("GET /notifications/:id error:", err);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// });

// /**
//  * PUT /notifications/:id/ack
//  * Mark delivery as read/acknowledged
//  * body: { userId, channel }
//  */
// router.put("/notifications/:id/ack", async (req: Request, res: Response) => {
//   try {
//     const { userId, channel } = req.body;
//     if (!userId || !channel) return res.status(400).json({ success: false, message: "userId and channel required" });

//     const notif = await Notification.findById(req.params.id);
//     if (!notif) return res.status(404).json({ success: false, message: "Not found" });

//     // find matching delivery
//     const delivery = notif.deliveries.find((d: any) => d.to.equals(userId) && d.channel === channel);
//     if (delivery) {
//       delivery.status = "read";
//       delivery.readAt = new Date();
//     } else {
//       // Optionally push a delivery entry if missing (e.g., audience all and no per-user entry)
//       notif.deliveries.push({ to: new mongoose.Types.ObjectId(userId), channel, status: "read", readAt: new Date() } as any);
//     }

//     await notif.save();
//     res.json({ success: true, data: notif });
//   } catch (err: any) {
//     console.error("PUT /notifications/:id/ack error:", err);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// });

// /**
//  * POST /notifications/send-now
//  * Trigger send for a notification (typically used by scheduler)
//  * body: { notificationId }
//  *
//  * NOTE: this route only updates DB and returns recipients. Actual external sending (SMS/Email/Push) should be done by a worker.
//  */
// router.post("/notifications/send-now", async (req: Request, res: Response) => {
//   try {
//     const { notificationId } = req.body;
//     if (!notificationId) return res.status(400).json({ success: false, message: "notificationId required" });

//     const notif = await Notification.findById(notificationId);
//     if (!notif) return res.status(404).json({ success: false, message: "Not found" });

//     // Resolve audience to user ids (simple resolution - replace with robust implementation)
//     const userIds = await resolveAudience(notif.audience);
//     // Create delivery objects if not present
//     for (const uid of userIds) {
//       for (const ch of notif.channels) {
//         const exists = notif.deliveries.some((d: any) => d.to.equals(uid) && d.channel === ch);
//         if (!exists) notif.deliveries.push({ to: uid, channel: ch, status: "pending" } as any);
//       }
//     }
//     await notif.save();

//     // Return list of userIds & channels for worker to act on
//     const pending = notif.deliveries.filter((d: any) => d.status === "pending");
//     res.json({ success: true, pending: pending.map((p: any) => ({ to: p.to, channel: p.channel })) });
//   } catch (err: any) {
//     console.error("POST /notifications/send-now error:", err);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// });

// /* ---------------------------
//    TEMPLATE MANAGEMENT (optional)
// --------------------------- */

// /**
//  * POST /templates
//  * Create a notification template
//  */
// router.post("/templates", async (req: Request, res: Response) => {
//   try {
//     const { name, titleTemplate, bodyTemplate, channels } = req.body;
//     if (!name || !titleTemplate || !bodyTemplate) return res.status(400).json({ success: false, message: "Invalid input" });

//     const tpl = await NotificationTemplate.create({ name, titleTemplate, bodyTemplate, channels });
//     res.status(201).json({ success: true, data: tpl });
//   } catch (err: any) {
//     console.error("POST /templates error:", err);
//     res.status(400).json({ success: false, message: "Create failed", error: err.message });
//   }
// });

// /**
//  * GET /templates
//  */
// router.get("/templates", async (_req: Request, res: Response) => {
//   try {
//     const items = await NotificationTemplate.find().lean();
//     res.json({ success: true, data: items });
//   } catch (err: any) {
//     console.error("GET /templates error:", err);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// });

// export default router;
