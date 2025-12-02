// models/Reporting.ts
import mongoose, { Schema, Document } from "mongoose";

/**
 * AuditLog - simple event logging for reports & compliance
 */
export interface IAuditLog extends Document {
  actorId?: mongoose.Types.ObjectId; // user who performed action
  actorName?: string;
  action: string;
  resource?: string;
  resourceId?: string;
  details?: any;
  ip?: string;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    actorId: { type: Schema.Types.ObjectId, ref: "User" },
    actorName: String,
    action: { type: String, required: true },
    resource: String,
    resourceId: String,
    details: Schema.Types.Mixed,
    ip: String,
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const AuditLog = mongoose.model<IAuditLog>("AuditLog", AuditLogSchema, "AuditLog");

/**
 * ReportSchedule - optional model to store scheduled reports
 */
export interface IReportSchedule extends Document {
  name: string;
  endpoint: string; // e.g. '/api/reports/revenue/summary'
  params?: any;
  cron?: string;
  lastRunAt?: Date;
  recipients?: string[]; // emails
  enabled?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ReportScheduleSchema = new Schema<IReportSchedule>(
  {
    name: { type: String, required: true },
    endpoint: { type: String, required: true },
    params: Schema.Types.Mixed,
    cron: String,
    lastRunAt: Date,
    recipients: [String],
    enabled: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const ReportSchedule = mongoose.model<IReportSchedule>(
  "ReportSchedule",
  ReportScheduleSchema, "reports"
);
