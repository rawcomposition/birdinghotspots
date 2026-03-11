import admin from "firebase-admin";
import Profile from "../models/Profile";
import mongoose from "mongoose";
import * as dotenv from "dotenv";
import dayjs from "dayjs";
import fs from "fs";
dotenv.config();

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      // @ts-ignore
      project_id: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY,
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
    }),
  });
}

const URI = process.env.MONGO_URI;
const connect = async () => (URI ? mongoose.connect(URI) : null);

const exportUsersCsv = async () => {
  await connect();

  const [firebaseUsers, profiles] = await Promise.all([admin.auth().listUsers(), Profile.find({}).lean()]);

  const activeUsers = firebaseUsers.users
    .filter(({ email, passwordHash, disabled }) => email && passwordHash && !disabled)
    .map(({ email, displayName, uid, customClaims }) => {
      const profile = uid ? profiles.find((p) => p.uid === uid) : null;
      const role = customClaims?.role || "user";
      const regions = customClaims?.role === "admin" ? "world" : (customClaims?.regions || []).join(",");
      const ebirdId = profile?.ebirdId || "";
      const subscriptions = (profile?.subscriptions || []).join(",");
      return { displayName: displayName || email, role, regions, ebirdId, subscriptions };
    });

  const csvHeader = "User,Role,eBird ID,Access,Focus Regions";
  const csvBody = activeUsers.map(
    ({ displayName, role, regions, ebirdId, subscriptions }) =>
      `"${displayName}",${role},${ebirdId},"${regions}","${subscriptions}"`
  );

  const fileName = `users-${dayjs().format("YYYY-MM-DD-HH-mm-ss")}.csv`;
  try {
    if (!fs.existsSync("exports")) {
      fs.mkdirSync("exports");
    }
    fs.writeFileSync(`exports/${fileName}`, `${csvHeader}\n${csvBody.join("\n")}`);
    console.log(`Exported ${activeUsers.length} active users to exports/${fileName}`);
  } catch (error) {
    console.error(`Failed to write file: ${error}`);
    process.exit(1);
  }

  process.exit();
};

exportUsersCsv();
