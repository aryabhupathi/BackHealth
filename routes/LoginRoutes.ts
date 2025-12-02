import { Router, Request, Response } from "express";
import { Types } from "mongoose";
import User, { IUser, UserRole } from "../models/User";
import Patient, { IPatient } from "../models/Patient";
import Doctor, { IDoctor } from "../models/Doctor";
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
    const { name, email, password, role = UserRole.Patient, phone } = req.body;
    const validationErrors = validateInput(name, email, password);
    if (validationErrors.length > 0) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Validation failed",
          errors: validationErrors,
        });
    }
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res
        .status(400)
        .json({
          success: false,
          message: "User already exists with this email",
        });
    }
    const user: IUser = await User.create({
      name: name.trim(),
      email: email.toLowerCase(),
      password,
      role,
      verified: false,
    });
    let linkedProfile: IPatient | IDoctor | null = null;
    if (role === UserRole.Doctor) {
      linkedProfile = await Doctor.create({
        fullName: name,
        userId: user._id,
      });
    } else if (role === UserRole.Patient) {
      linkedProfile = await Patient.findOne({
        $or: [{ "contact.phone": phone }],
      });
      if (!linkedProfile) {
        linkedProfile = await Patient.create({
          fullName: name,
          contact: { phone },
          userId: user._id,
        });
      }
    }
    if (linkedProfile) {
      user.linkedProfile = linkedProfile._id as Types.ObjectId;
      await user.save();
    }
    res.status(201).json({
      success: true,
      message: `User registered successfully${
        linkedProfile ? " and linked to profile" : ""
      }`,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          linkedProfile: linkedProfile || null,
        },
      },
    });
  } catch (err: any) {
    console.error("Registration error:", err);
    res
      .status(500)
      .json({
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
    res
      .status(500)
      .json({
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
    res
      .status(500)
      .json({
        success: false,
        message: "Server error while fetching users",
        error: err.message,
      });
  }
});
export default router;
