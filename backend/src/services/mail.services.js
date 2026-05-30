import "../config/env.js";
import nodemailer from "nodemailer";
import { google } from "googleapis";

const OAuth2 = google.auth.OAuth2;

const oauth2Client = new OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "https://developers.google.com/oauthplayground",
);
// console.log(process.env.GOOGLE_REFRESH_TOKEN);

oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

const gmailUser = process.env.GOOGLE_USER;

async function createTransporter() {
  const accessToken = await oauth2Client.getAccessToken();

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: gmailUser,
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
      accessToken: accessToken.token,
    },
  });
}

export async function sendMail({ to, subject, html, text }) {
  const transporter = await createTransporter();

  return transporter.sendMail({
    from: gmailUser,
    to,
    subject,
    html,
    text,
  });
}

export async function verifyMailTransporter() {
  try {
    const transporter = await createTransporter();

    await transporter.verify();

    console.log("Email transporter is ready to send email");

    return true;
  } catch (error) {
    console.error("Email transporter verification failed:", error);

    return false;
  }
}
