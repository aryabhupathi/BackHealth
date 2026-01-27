import nodemailer from "nodemailer";

console.log({
  user: process.env.GMAIL_USER,
  pass: process.env.GMAIL_PASS ? "✔ Loaded" : "❌ Missing",
});


export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});
