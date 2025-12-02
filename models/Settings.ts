// models/SystemSettings.ts
import mongoose, { Schema, Document } from "mongoose";

/**
 * Single collection storing site-wide settings.
 * We keep a single document (singleton) -- the routes will create it if missing.
 */

export interface IGeneralSettings {
  hospitalName?: string;
  logoUrl?: string;
  address?: string;
  phone?: string;
  email?: string;
  timezone?: string; // e.g., "Asia/Kolkata"
  dateFormat?: string; // e.g., "DD-MM-YYYY"
  currency?: string; // e.g., "INR"
}

export interface IAuthSettings {
  passwordPolicy?: {
    minLength?: number;
    requireNumbers?: boolean;
    requireUpper?: boolean;
    expireDays?: number | null;
  };
  sessionTimeoutMinutes?: number;
  enable2FA?: boolean;
  allowedOAuthProviders?: string[]; // e.g., ['google', 'azure']
}

export interface IBillingSettings {
  defaultTaxPercent?: number;
  enableInsurance?: boolean;
  insuranceProviders?: { code: string; name: string }[];
  paymentGateway?: {
    provider?: string; // 'stripe' | 'razorpay' | 'custom'
    publicKey?: string;
    secretKey?: string;
    mode?: 'test' | 'live';
  };
}

export interface INotificationSettings {
  email?: {
    smtpHost?: string;
    smtpPort?: number;
    secure?: boolean;
    username?: string;
    fromAddress?: string;
  };
  sms?: {
    provider?: string; // e.g., 'twilio'
    apiKey?: string;
  };
  push?: {
    provider?: string;
    serverKey?: string;
  };
  templates?: mongoose.Schema.Types.ObjectId[]; // optional refs to templates (not required)
}

export interface IIntegrationSettings {
  fhir?: {
    enabled?: boolean;
    baseUrl?: string;
    clientId?: string;
    clientSecret?: string;
  };
  hl7?: {
    enabled?: boolean;
    endpoint?: string;
  };
  accounting?: {
    enabled?: boolean;
    endpoint?: string;
  };
}

export interface IComplianceSettings {
  dataRetentionDays?: number | null; // null = unlimited
  enableAuditLogs?: boolean;
  piiMasking?: boolean;
}

export interface IFeatureFlags {
  features: Record<string, boolean>; // simple feature flags store
}

/* System Settings Document */
export interface ISystemSettings extends Document {
  general: IGeneralSettings;
  auth: IAuthSettings;
  billing: IBillingSettings;
  notification: INotificationSettings;
  integrations: IIntegrationSettings;
  compliance: IComplianceSettings;
  features: IFeatureFlags;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const GeneralSchema = new Schema<IGeneralSettings>({
  hospitalName: String,
  logoUrl: String,
  address: String,
  phone: String,
  email: String,
  timezone: { type: String, default: "UTC" },
  dateFormat: { type: String, default: "YYYY-MM-DD" },
  currency: { type: String, default: "USD" },
}, { _id: false });

const AuthSchema = new Schema<IAuthSettings>({
  passwordPolicy: {
    minLength: { type: Number, default: 8 },
    requireNumbers: { type: Boolean, default: true },
    requireUpper: { type: Boolean, default: false },
    expireDays: { type: Number, default: null },
  },
  sessionTimeoutMinutes: { type: Number, default: 120 },
  enable2FA: { type: Boolean, default: false },
  allowedOAuthProviders: [{ type: String }],
}, { _id: false });

const BillingSchema = new Schema<IBillingSettings>({
  defaultTaxPercent: { type: Number, default: 0 },
  enableInsurance: { type: Boolean, default: false },
  insuranceProviders: [{ code: String, name: String }],
  paymentGateway: {
    provider: String,
    publicKey: String,
    secretKey: String,
    mode: { type: String, enum: ["test", "live"], default: "test" },
  },
}, { _id: false });

const NotificationSchema = new Schema<INotificationSettings>({
  email: {
    smtpHost: String,
    smtpPort: Number,
    secure: Boolean,
    username: String,
    fromAddress: String,
  },
  sms: {
    provider: String,
    apiKey: String,
  },
  push: {
    provider: String,
    serverKey: String,
  },
  templates: [{ type: Schema.Types.ObjectId, ref: "NotificationTemplate" }],
}, { _id: false });

const IntegrationSchema = new Schema<IIntegrationSettings>({
  fhir: {
    enabled: { type: Boolean, default: false },
    baseUrl: String,
    clientId: String,
    clientSecret: String,
  },
  hl7: {
    enabled: { type: Boolean, default: false },
    endpoint: String,
  },
  accounting: {
    enabled: { type: Boolean, default: false },
    endpoint: String,
  },
}, { _id: false });

const ComplianceSchema = new Schema<IComplianceSettings>({
  dataRetentionDays: { type: Number, default: null },
  enableAuditLogs: { type: Boolean, default: true },
  piiMasking: { type: Boolean, default: true },
}, { _id: false });

const FeaturesSchema = new Schema<IFeatureFlags>({
  features: { type: Schema.Types.Mixed, default: {} },
}, { _id: false });

const SystemSettingsSchema = new Schema<ISystemSettings>({
  general: { type: GeneralSchema, default: {} },
  auth: { type: AuthSchema, default: {} },
  billing: { type: BillingSchema, default: {} },
  notification: { type: NotificationSchema, default: {} },
  integrations: { type: IntegrationSchema, default: {} },
  compliance: { type: ComplianceSchema, default: {} },
  features: { type: FeaturesSchema, default: {} },
  updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

// Optional: ensure a singleton by creating an index on a fixed key? Simpler to ensure via routes.
export default mongoose.model<ISystemSettings>("SystemSettings", SystemSettingsSchema);
