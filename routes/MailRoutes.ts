import { transporter } from "../utils/Mailer";

export async function sendAppointmentMail(
  email: string,
  name: string,
  date: string,
  time: string
) {
  await transporter.sendMail({
    from: `"Healthcare App" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: "Appointment Confirmation",
    html: `
      <p>Hello ${name},</p>
      <p>Your appointment is confirmed.</p>
      <p><b>Date:</b> ${date}</p>
      <p><b>Time:</b> ${time}</p>
      <p>⚠️ Please arrive 10 minutes early.</p>
    `,
  });
}

export async function sendMail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  return transporter.sendMail({
    from: `"CareTrack" <${process.env.GMAIL_USER}>`,
    to,
    subject,
    html,
  });
}
