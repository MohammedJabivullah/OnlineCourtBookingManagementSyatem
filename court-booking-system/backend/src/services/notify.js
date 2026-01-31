import nodemailer from "nodemailer"
import twilio from "twilio"

const mailer = process.env.SMTP_HOST
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: false,
      auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
    })
  : null

const smsClient = process.env.TWILIO_SID && process.env.TWILIO_TOKEN
  ? twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN)
  : null

export async function sendEmail(to, subject, text) {
  if (!to || !mailer) return false
  try {
    await mailer.sendMail({ from: process.env.SMTP_FROM || "noreply@example.com", to, subject, text })
    return true
  } catch {
    return false
  }
}

export async function sendSMS(to, text) {
  if (!to || !smsClient || !process.env.TWILIO_FROM) return false
  try {
    await smsClient.messages.create({ from: process.env.TWILIO_FROM, to, body: text })
    return true
  } catch {
    return false
  }
}


