import nodemailer, { SendMailOptions, Transporter } from "nodemailer";
import { IMailData } from "./types/mail.types";
import { readEmailTemplate } from "../utils/utils";

export const sendMail = async (options: SendMailOptions): Promise<void> => {
  console.log(process.env.BREVO_USER);
  console.log(process.env.BREVO_PASS);

  const transporter: Transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 465,
    auth: {
      user: process.env.BREVO_USER,
      pass: process.env.BREVO_PASS,
    },
  });

  transporter.sendMail(options, (err, info) => {
    if (err) {
      console.error("Failed to send email:", err);
    } else {
      console.log("Email sent:", info.response);
    }
  });
};


export async function sendEMail(payload: IMailData): Promise<string> {
  // Load the specified email template
  const emailTemplate = readEmailTemplate(payload.templateKey);

  // Replace placeholders dynamically
  let emailContent = emailTemplate;
  for (const [key, value] of Object.entries(payload.placeholders)) {
    emailContent = emailContent.replace(new RegExp(`{{${key}}}`, "g"), value);
  }

  const mailOptions: SendMailOptions = {
    from: '"Notion Bot" <noreply@notionbot.com>',
    to: payload.email,
    subject: payload.subject,
    html: emailContent,
  };

  // Send the email
  await sendMail(mailOptions);

  return "Email Delivered";
}
