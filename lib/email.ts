import nodemailer from "nodemailer";

type Props = {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
};

export const sendEmail = async ({ to, subject, html, replyTo }: Props) => {
  const transporter = nodemailer.createTransport({
    host: "smtp-relay.sendinblue.com",
    port: 587,
    auth: {
      user: "noreply.birdinghotspots@gmail.com",
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: '"BirdingHotspots.org" <noreply.birdinghotspots@gmail.com>',
    to,
    subject,
    html,
    replyTo,
  });
};
