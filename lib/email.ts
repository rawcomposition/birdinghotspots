import nodemailer from "nodemailer";

type Props = {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
};

export const sendEmail = async ({ to, subject, html, replyTo }: Props) => {
  if (process.env.NODE_ENV === "development") {
    console.log("Sending email to", to, "with subject", subject, "and html", html);
    return;
  }

  const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    auth: {
      user: "noreply.birdinghotspots@gmail.com",
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: '"BirdingHotspots.org" <no-reply@birdinghotspots.org>',
    to,
    subject,
    html,
    replyTo,
  });
};

export const sendInviteEmail = async (name: string, email: string, inviteCode: string) => {
  await sendEmail({
    to: email,
    subject: "BirdingHotspots.org Editor Invite",
    html: `Hi ${name},<br /><br />You have been invited to join the BirdingHotspots.org team as an editor. Please click the link below to set your password and start editing.<br /><br /><a href="https://birdinghotspots.org/join/${inviteCode}">Set Password</a><br /><br />If you did not request this invite, please ignore this email.<br /><br />Thanks,<br />The BirdingHotspots.org Team`,
    replyTo: email,
  });
};

export const sendResetEmail = async (name: string, email: string, url: string) => {
  await sendEmail({
    to: email,
    subject: "Reset your password for BirdingHotspots.org",
    html: `Hi ${name},<br /><br />Follow this link to reset your BirdingHotspots password.<br /><br /><a href="${url}">${url}</a><br /><br />If you did not ask to reset your password, you can ignore this email.<br /><br />Thanks,<br />The BirdingHotspots.org Team`,
  });
};
