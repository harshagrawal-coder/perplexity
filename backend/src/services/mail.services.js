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

function createAppPasswordTransporter() {
  if (!gmailUser || !process.env.GOOGLE_APP_PASSWORD) {
    return null;
  }

  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    family: 4,
    auth: {
      user: gmailUser,
      pass: process.env.GOOGLE_APP_PASSWORD,
    },
  });
}

async function createOAuthTransporter() {
  console.log("Using OAuth transporter");
  console.log("Refresh token exists:", !!process.env.GOOGLE_REFRESH_TOKEN);
  if (
    !gmailUser ||
    !process.env.GOOGLE_CLIENT_ID ||
    !process.env.GOOGLE_CLIENT_SECRET ||
    !process.env.GOOGLE_REFRESH_TOKEN
  ) {
    return null;
  }

  const accessToken = await oauth2Client.getAccessToken();
  const resolvedAccessToken =
    typeof accessToken === "string" ? accessToken : accessToken?.token;

  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    family: 4,
    auth: {
      type: "OAuth2",
      user: gmailUser,
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
      accessToken: resolvedAccessToken,
    },
  });
}

async function createTransporter() {
  const errors = [];

  const appPasswordTransporter = createAppPasswordTransporter();
  if (appPasswordTransporter) {
    return appPasswordTransporter;
  }

  try {
    const oauthTransporter = await createOAuthTransporter();
    if (oauthTransporter) {
      return oauthTransporter;
    }
  } catch (error) {
    errors.push(error.message);
  }

  throw new Error(
    errors[0] ||
      "Email transporter is not configured. Provide Gmail app password or OAuth credentials.",
  );
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
