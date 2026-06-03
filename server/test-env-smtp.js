require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.hostinger.com",
  port: parseInt(process.env.SMTP_PORT || "465"),
  secure: parseInt(process.env.SMTP_PORT || "465", 10) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: { rejectUnauthorized: false },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 20000,
  ignoreTLS: false,
  requireTLS: true,
  family: 4
});

console.log("Configured Transporter:", {
  host: transporter.options.host,
  port: transporter.options.port,
  secure: transporter.options.secure,
  user: transporter.options.auth.user,
  pass: transporter.options.auth.pass ? "***" : "none"
});

transporter.verify(function(error, success) {
  if (error) {
    console.log("Error:", error);
  } else {
    console.log("Server is ready to take our messages");
  }
});
