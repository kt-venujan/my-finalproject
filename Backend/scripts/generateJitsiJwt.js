import dotenv from "dotenv";
import { randomUUID } from "crypto";
import { generate } from "../utils/jitsiJwt.js";

dotenv.config();

const appId = process.env.JITSI_APP_ID || process.env.JITSI_JWT_SUBJECT;
const kid = process.env.JITSI_API_KEY || process.env.JITSI_JWT_KID;
const privateKey = process.env.JITSI_JWT_PRIVATE_KEY;

if (!appId) {
  throw new Error("Missing appId. Set JITSI_APP_ID or JITSI_JWT_SUBJECT in Backend/.env");
}

if (!kid) {
  throw new Error("Missing kid. Set JITSI_API_KEY or JITSI_JWT_KID in Backend/.env");
}

if (!privateKey) {
  throw new Error("Missing private key. Set JITSI_JWT_PRIVATE_KEY in Backend/.env");
}

const token = generate(privateKey, {
  id: randomUUID(),
  name: process.env.JITSI_TEST_USER_NAME || "my user name",
  email: process.env.JITSI_TEST_USER_EMAIL || "my user email",
  avatar: process.env.JITSI_TEST_USER_AVATAR || "",
  appId,
  kid,
  room: process.env.JITSI_TEST_ROOM || "*",
  issuer: process.env.JITSI_JWT_ISSUER || "chat",
  audience: process.env.JITSI_JWT_AUDIENCE || "jitsi",
  expiresInMinutes: Number(process.env.JITSI_JWT_EXPIRES_IN_MINUTES || 60),
  moderator: true,
});

console.log(token);
