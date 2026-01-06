export const registerSuccessEmail = (name: string) => `
  <h2>Welcome to CareTrack 🏥</h2>
  <p>Hello ${name},</p>
  <p>Your patient account has been created successfully.</p>
  <p>You can now log in and manage your appointments.</p>
  <br />
  <small>Do not reply to this email.</small>
`;
export const loginAlertEmail = (name: string) => `
  <h3>New Login Detected</h3>
  <p>Hello ${name},</p>
  <p>You have successfully logged in to your CareTrack account.</p>
  <p>If this wasn’t you, please reset your password immediately.</p>
`;
export const patientLoginCreatedEmail = (name: string) => `
  <h2>Welcome to CareTrack 🏥</h2>
  <p>Hello ${name},</p>

  <p>Your patient account has been created.</p>
  <p>Please log in using your email and reset your password.</p>

  <small>This is an automated email.</small>
`;
export const doctorAccountCreatedEmail = (
  name: string,
  email: string
) => `
  <h2>Welcome to CareTrack 🏥</h2>
  <p>Dear Dr. ${name},</p>

  <p>Your doctor account has been created successfully.</p>

  <p><b>Email:</b> ${email}</p>
  <p>Please log in and change your password immediately.</p>

  <small>This is an automated message.</small>
`;
export const doctorAppointmentBookedEmail = (
  name: string,
  date: string,
  time: string,
  mode: string
) => `
  <h3>New Appointment Scheduled</h3>
  <p>Hello Dr. ${name},</p>

  <p>You have a new appointment.</p>

  <ul>
    <li><b>Date:</b> ${date}</li>
    <li><b>Time:</b> ${time}</li>
    <li><b>Mode:</b> ${mode}</li>
  </ul>

  <small>Please check your dashboard for details.</small>
`;
export const appointmentBookedPatientEmail = (
  patientName: string,
  doctorName: string,
  date: string,
  time: string,
  type: string
) => `
  <h2>Appointment Confirmed</h2>
  <p>Hello ${patientName},</p>

  <p>Your appointment has been booked successfully.</p>

  <ul>
    <li><b>Doctor:</b> Dr. ${doctorName}</li>
    <li><b>Date:</b> ${date}</li>
    <li><b>Time:</b> ${time}</li>
    <li><b>Type:</b> ${type}</li>
  </ul>

  <small>Please arrive 10 minutes early.</small>
`;
export const appointmentStatusEmail = (
  patientName: string,
  status: string,
  date: string,
  time: string
) => `
  <h3>Appointment Status Updated</h3>
  <p>Hello ${patientName},</p>

  <p>Your appointment scheduled on <b>${date}</b> at <b>${time}</b>
  is now <b>${status.toUpperCase()}</b>.</p>
`;
export const prescriptionCreatedEmail = (
  patientName: string,
  appointmentDate: string
) => `
  <h3>Your Prescription Is Ready</h3>

  <p>Hello ${patientName},</p>

  <p>Your prescription from your visit on <b>${appointmentDate}</b> is now available.</p>

  <p>Please log in to CareTrack to view your prescription securely.</p>

  <small>
    For your privacy, medical details are not included in this email.
  </small>
`;

