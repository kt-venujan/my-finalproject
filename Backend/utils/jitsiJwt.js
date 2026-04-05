import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";

const toBool = (value, defaultValue = false) => {
  if (value === undefined || value === null || value === "") return defaultValue;
  return String(value).trim().toLowerCase() === "true";
};

const normalizePrivateKey = (value) => {
  if (!value) return "";

  const normalized = String(value)
    .replace(/\\\\n/g, "\n")
    .replace(/\\n/g, "\n")
    .trim();

  if (normalized.includes("-----BEGIN") && normalized.includes("-----END")) {
    return normalized;
  }

  try {
    const decoded = Buffer.from(normalized, "base64").toString("utf8").trim();
    if (decoded.includes("-----BEGIN") && decoded.includes("-----END")) {
      return decoded;
    }
  } catch {
    // ignore base64 parse failures
  }

  return normalized;
};

const defaultFeatures = {
  livestreaming: false,
  "file-upload": false,
  "outbound-call": false,
  "sip-outbound-call": false,
  transcription: false,
  "list-visitors": false,
  recording: false,
  flip: false,
};

const buildRoomClaim = ({ roomName, appId, allowAllRooms }) => {
  if (allowAllRooms) return "*";

  const fullRoomName = String(roomName || "").trim();
  if (!fullRoomName) return "*";

  // For JaaS, the iframe room often uses "<appId>/<room>",
  // while JWT room claim is expected as the room segment.
  const appPrefix = `${String(appId || "").trim()}/`;
  if (appPrefix !== "/" && fullRoomName.startsWith(appPrefix)) {
    return fullRoomName.slice(appPrefix.length);
  }

  return fullRoomName;
};

export const generate = (privateKeyInput, options = {}) => {
  const privateKey = normalizePrivateKey(privateKeyInput);

  if (!privateKey) {
    throw new Error("Missing private key for Jitsi JWT generation");
  }

  const {
    id,
    name,
    email,
    avatar,
    appId,
    kid,
    room = "*",
    issuer = "chat",
    audience = "jitsi",
    expiresInMinutes = 60,
    moderator = false,
    hiddenFromRecorder = false,
    features = {},
  } = options;

  if (!appId) {
    throw new Error("Missing appId (JaaS app ID / vpaas magic cookie)");
  }

  if (!kid) {
    throw new Error("Missing kid (JaaS API key id)");
  }

  const now = Math.floor(Date.now() / 1000);
  const safeExpiry = Math.max(5, Number(expiresInMinutes || 60));

  const payload = {
    aud: audience,
    iss: issuer,
    sub: appId,
    room,
    iat: now,
    nbf: now - 5,
    exp: now + safeExpiry * 60,
    context: {
      features: {
        ...defaultFeatures,
        ...features,
      },
      user: {
        "hidden-from-recorder": hiddenFromRecorder,
        moderator,
        name: name || "Dietara Member",
        id: id || randomUUID(),
        avatar: avatar || "",
        email: email || "",
      },
    },
  };

  try {
    return jwt.sign(payload, privateKey, {
      algorithm: "RS256",
      header: {
        kid,
        typ: "JWT",
      },
    });
  } catch {
    throw new Error(
      "Invalid private key format for RS256. Use full PEM (BEGIN/END PRIVATE KEY) or base64-encoded PEM."
    );
  }
};

export const generateFromEnv = ({ roomName, user, isModerator } = {}) => {
  const requireJwt = toBool(process.env.JITSI_REQUIRE_JWT, true);

  if (!requireJwt) {
    return null;
  }

  const privateKey = process.env.JITSI_JWT_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error("JITSI_JWT_PRIVATE_KEY is required");
  }

  const appId = process.env.JITSI_APP_ID || process.env.JITSI_JWT_SUBJECT;
  const kid = process.env.JITSI_API_KEY || process.env.JITSI_JWT_KID;
  const allowAllRooms = toBool(process.env.JITSI_JWT_ALLOW_ALL_ROOMS, false);

  if (!appId) {
    throw new Error("JITSI_APP_ID or JITSI_JWT_SUBJECT is required");
  }

  if (!kid) {
    throw new Error("JITSI_API_KEY or JITSI_JWT_KID is required");
  }

  if (String(kid).toUpperCase().includes("SAMPLE_APP")) {
    throw new Error(
      "Jitsi API key id is still set to SAMPLE_APP. Replace JITSI_API_KEY/JITSI_JWT_KID with your real JaaS key id."
    );
  }

  const room = buildRoomClaim({ roomName, appId, allowAllRooms });

  const rawRole = String(user?.role || "").trim().toLowerCase();
  const normalizedRole = rawRole === "dietitian" ? "dietician" : rawRole;
  const moderatorRoles = String(process.env.JITSI_JWT_MODERATOR_ROLES || "dietician,admin")
    .split(",")
    .map((role) => role.trim().toLowerCase())
    .filter(Boolean)
    .map((role) => (role === "dietitian" ? "dietician" : role));
  const moderatorFromRole = moderatorRoles.includes(normalizedRole);
  const moderator = typeof isModerator === "boolean" ? isModerator : moderatorFromRole;

  return generate(privateKey, {
    id: user?._id?.toString() || randomUUID(),
    name: user?.username || "Dietara Member",
    email: user?.email || "",
    avatar: user?.avatar || "",
    appId,
    kid,
    room,
    issuer: process.env.JITSI_JWT_ISSUER || "chat",
    audience: process.env.JITSI_JWT_AUDIENCE || "jitsi",
    expiresInMinutes: Number(process.env.JITSI_JWT_EXPIRES_IN_MINUTES || 60),
    moderator,
  });
};
