import { Router, Request, Response } from "express";
import { Types } from "mongoose";
import User, { IUser, UserRole } from "../models/User";
import Patient from "../models/Patient";
import { sendMail } from "./MailRoutes";
import { loginAlertEmail, registerSuccessEmail } from "../models/MailModels";
const generatePatientId = async () => {
  const count = await Patient.countDocuments();
  return `PAT-${new Date().getFullYear()}-${(count + 1)
    .toString()
    .padStart(5, "0")}`;
};
const router = Router();
const validateInput = (name: string, email: string, password: string) => {
  const errors: string[] = [];
  if (!name || name.trim().length < 2)
    errors.push("Name must be at least 2 characters long");
  if (!email || !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email))
    errors.push("Please provide a valid email address");
  if (!password || password.length < 6)
    errors.push("Password must be at least 6 characters long");
  return errors;
};
router.post("/register", async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone } = req.body;
    const validationErrors = validateInput(name, email, password);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationErrors,
      });
    }
    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required",
      });
    }
    const existingUser = await User.findOne({
      email: email.toLowerCase(),
    });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
    }
    const user: IUser = await User.create({
      name: name.trim(),
      email: email.toLowerCase(),
      password,
      role: UserRole.Patient,
      verified: false,
    });
    const patientId = await generatePatientId();
    const patientProfile = await Patient.create({
      fullName: name,
      patientId,
      contact: { phone },
      userId: user._id,
    });
    user.linkedProfile = patientProfile._id as Types.ObjectId;
    await user.save();
    sendMail({
      to: user.email,
      subject: "Welcome to CareTrack",
      html: registerSuccessEmail(user.name),
    }).catch(console.error);
    res.status(201).json({
      success: true,
      message: "Patient registered successfully",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          linkedProfile: patientProfile,
        },
      },
    });
  } catch (err: any) {
    console.error("Registration error:", err);
    res.status(500).json({
      success: false,
      message: "Server error during registration",
      error: err.message,
    });
  }
});
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and password are required" });
    }
    const user: IUser | null = await User.findOne({
      email: email.toLowerCase(),
    }).select("+password");
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }
    if (user.role === UserRole.Patient || user.role === UserRole.Doctor) {
      await user.populate("linkedProfile");
    }
    sendMail({
      to: user.email,
      subject: "New Login to CareTrack",
      html: loginAlertEmail(user.name),
    }).catch(console.error);
    res.json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          linkedProfile: user.linkedProfile || null,
        },
      },
    });
  } catch (err: any) {
    console.error("Login error:", err);
    res.status(500).json({
      success: false,
      message: "Server error during login",
      error: err.message,
    });
  }
});
router.get("/users", async (req: Request, res: Response) => {
  try {
    const users = await User.find().select("-password");
    await Promise.all(
      users.map(async (user) => {
        if (user.role === UserRole.Patient || user.role === UserRole.Doctor) {
          await user.populate("linkedProfile");
        }
      })
    );
    res.json({ success: true, count: users.length, data: users });
  } catch (err: any) {
    console.error("Error fetching users:", err);
    res.status(500).json({
      success: false,
      message: "Server error while fetching users",
      error: err.message,
    });
  }
});
router.post("/forgot-password", async (req: Request, res: Response) => {
  const { email } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user) {
    return res.json({ message: "If email exists, reset link sent" });
  }

  const resetToken = Math.random().toString(36).substring(2);

  user.resetToken = resetToken;
  user.resetTokenExpire = new Date(Date.now() + 15 * 60 * 1000);

  await user.save();

  const resetLink = `http://localhost:5173/reset-password/${resetToken}`;

  await sendMail({
    to: user.email,
    subject: "Reset Your Password",
    html: `
      <p>Hello ${user.name},</p>
      <p>You requested to reset your password.</p>
      <p>
        <a href="${resetLink}" target="_blank">
          Click here to reset your password
        </a>
      </p>
      <p>This link will expire in 15 minutes.</p>
    `,
  });

  res.json({ message: "Reset link sent" });
});


router.post("/reset-password/:token", async (req: Request, res: Response) => {
  const { password } = req.body;

  if (!password || password.length < 6) {
    return res.status(400).json({ message: "Password too short" });
  }

  const user = await User.findOne({
    resetToken: req.params.token,
    resetTokenExpire: { $gt: new Date() },
  });

  if (!user) {
    return res.status(400).json({ message: "Invalid or expired token" });
  }

  user.password = password; // ⚠️ plain text
  user.resetToken = undefined;
  user.resetTokenExpire = undefined;

  await user.save();

  res.json({ message: "Password reset successful" });
});


export default router;
