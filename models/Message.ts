// models/messagesNotifications.ts
import express, { Request, Response } from "express";
import mongoose, { Schema, Document } from "mongoose";

/* ============================
   MONGOOSE MODELS
   ============================ */

/**
 * Message
 * - Single message inside a Thread
 */
export interface IMessage {
  senderId: mongoose.Types.ObjectId; // staff or patient id
  senderName?: string;
  content: string;
  attachments?: { url: string; name?: string }[];
  readBy?: mongoose.Types.ObjectId[]; // which user ids have read
  createdAt?: Date;
}

const MessageSubSchema = new Schema<IMessage>(
  {
    senderId: { type: Schema.Types.ObjectId, required: true, refPath: "senderModel" },
    senderName: String,
    content: { type: String, required: true },
    attachments: [{ url: String, name: String }],
    readBy: [{ type: Schema.Types.ObjectId }],
  },
  { timestamps: { createdAt: true, updatedAt: false }, _id: false }
);

/**
 * Thread (Conversation)
 * - one-to-one (patient <> staff) or group conversation (department / role)
 */
export interface IThread extends Document {
  title?: string;
  participants: { userId: mongoose.Types.ObjectId; model: string }[]; // model: 'User' or 'Patient' etc
  isGroup?: boolean;
  department?: mongoose.Types.ObjectId; // optional
  lastMessageAt?: Date;
  messages: IMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const ParticipantSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, required: true },
    model: { type: String, default: "User" }, // for polymorphic references if needed
  },
  { _id: false }
);

const ThreadSchema = new Schema<IThread>(
  {
    title: String,
    participants: { type: [ParticipantSchema], required: true },
    isGroup: { type: Boolean, default: false },
    department: { type: Schema.Types.ObjectId, ref: "Department" },
    messages: { type: [MessageSubSchema], default: [] },
    lastMessageAt: Date,
  },
  { timestamps: true }
);

export const Thread = mongoose.model<IThread>("Thread", ThreadSchema);

/* ---------------------------
   Notification Delivery Subdoc
   --------------------------- */
export interface IDelivery extends Document {
  to: mongoose.Types.ObjectId; // user or patient id
  channel: "in_app" | "email" | "sms" | "push" | "whatsapp";
  status: "pending" | "sent" | "delivered" | "failed" | "read";
  providerResponse?: any;
  sentAt?: Date;
  deliveredAt?: Date;
  readAt?: Date;
}

const DeliverySchema = new Schema(
  {
    to: { type: Schema.Types.ObjectId, required: true },
    channel: { type: String, enum: ["in_app", "email", "sms", "push", "whatsapp"], default: "in_app" },
    status: { type: String, enum: ["pending", "sent", "delivered", "failed", "read"], default: "pending" },
    providerResponse: Schema.Types.Mixed,
    sentAt: Date,
    deliveredAt: Date,
    readAt: Date,
  },
  { _id: false }
);

/* ---------------------------
   Notification Model
   --------------------------- */
export interface INotification extends Document {
  title: string;
  body: string;
  meta?: any; // structured payload e.g., { appointmentId }
  audience: {
    // flexible targeting
    users?: mongoose.Types.ObjectId[]; // explicit user ids
    roles?: string[]; // role strings e.g., ['doctor','nurse']
    departments?: mongoose.Types.ObjectId[]; // departments
    all?: boolean;
  };
  channels: ("in_app" | "email" | "sms" | "push" | "whatsapp")[]; // channels to send
  priority: "low" | "normal" | "high" | "critical";
  scheduledFor?: Date | null; // if present — schedule instead of immediate
  deliveries: IDelivery[]; // per-user per-channel delivery info
  createdBy?: mongoose.Types.ObjectId; // admin who created
  createdAt?: Date;
  updatedAt?: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    title: { type: String, required: true },
    body: { type: String, required: true },
    meta: Schema.Types.Mixed,
    audience: {
      users: [{ type: Schema.Types.ObjectId }],
      roles: [{ type: String }],
      departments: [{ type: Schema.Types.ObjectId }],
      all: { type: Boolean, default: false },
    },
    channels: [{ type: String, enum: ["in_app", "email", "sms", "push", "whatsapp"], required: true }],
    priority: { type: String, enum: ["low", "normal", "high", "critical"], default: "normal" },
    scheduledFor: { type: Date, default: null },
    deliveries: { type: [DeliverySchema], default: [] },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export const Notification = mongoose.model<INotification>("Notification", NotificationSchema);

/* ---------------------------
   Notification Template
   --------------------------- */
export interface INotificationTemplate extends Document {
  name: string;
  titleTemplate: string; // e.g., "Lab result ready for {{patientName}}"
  bodyTemplate: string; // handlebars-like
  channels: string[];
  createdAt: Date;
  updatedAt: Date;
}

const NotificationTemplateSchema = new Schema<INotificationTemplate>(
  {
    name: { type: String, required: true, unique: true },
    titleTemplate: { type: String, required: true },
    bodyTemplate: { type: String, required: true },
    channels: [{ type: String }],
  },
  { timestamps: true }
);

export const NotificationTemplate = mongoose.model<INotificationTemplate>(
  "NotificationTemplate",
  NotificationTemplateSchema
);

/* ---------------------------
   Scheduled Notification (Optional)
   --------------------------- */
export interface IScheduledNotification extends Document {
  notificationId: mongoose.Types.ObjectId;
  cron?: string;
  runAt?: Date;
  enabled: boolean;
  lastRunAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ScheduledNotificationSchema = new Schema<IScheduledNotification>(
  {
    notificationId: { type: Schema.Types.ObjectId, ref: "Notification", required: true },
    cron: String,
    runAt: Date,
    enabled: { type: Boolean, default: true },
    lastRunAt: Date,
  },
  { timestamps: true }
);

export const ScheduledNotification = mongoose.model<IScheduledNotification>(
  "ScheduledNotification",
  ScheduledNotificationSchema
);

/* ============================
   EXPRESS ROUTES
   ============================ */

const router = express.Router();

/**
 * NOTE: add your auth middleware in your app (e.g., router.use(auth))
 * and ensure req.user contains authenticated user id and role.
 */

/* ---------------------------
   MESSAGE THREADS & MESSAGES
   Routes:
   - GET /messages?userId=&page=&limit=  -> list threads for user (inbox)
   - GET /messages/thread/:threadId      -> get thread + messages
   - POST /messages/thread               -> create thread (participants + optional initial message)
   - POST /messages/thread/:threadId     -> post a message to thread
   - PUT /messages/thread/:threadId/read -> mark messages as read for a user
   - DELETE /messages/thread/:threadId   -> delete/close thread (soft-delete ideally)
--------------------------- */

/**
 * GET /messages
 * List threads for the current user (inbox)
 * query:
 *   page, limit, q (search)
 */