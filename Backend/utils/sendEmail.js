import nodemailer from "nodemailer";

const sendEmail = async ({ to, subject, html }) => {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT || 465);
  const smtpSecure = String(process.env.SMTP_SECURE || "true") === "true";

  const transporter = nodemailer.createTransport({
    ...(smtpHost
      ? {
          host: smtpHost,
          port: smtpPort,
          secure: smtpSecure,
        }
      : { service: "gmail" }),
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"Dietara Hub" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  };

  await transporter.sendMail(mailOptions);
};

export default sendEmail;