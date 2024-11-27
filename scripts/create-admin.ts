import readline from "readline";
import Profile from "../models/Profile";
import firebase from "firebase-admin";
import mongoose from "mongoose";
import * as dotenv from "dotenv";
dotenv.config();

const URI = process.env.MONGO_URI;
const connect = async () => (URI ? mongoose.connect(URI) : null);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

if (!firebase.apps.length) {
  firebase.initializeApp({
    credential: firebase.credential.cert({
      // @ts-ignore
      project_id: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
    }),
    storageBucket: `${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.appspot.com`,
  });
}

export const admin = firebase;
export const auth = firebase.auth();

rl.question(`Enter your name: `, (name: string) => {
  rl.question(`Enter your email: `, (email: string) => {
    rl.question(`Create a password: `, async (password: string) => {
      await connect();

      console.log("Creating Firebase user...");
      const user = await auth.createUser({ email, displayName: name, password });

      console.log("Creating MongoDB profile...");
      const profile = await Profile.create({
        uid: user.uid,
        name,
        email: email.toLowerCase(),
      });

      console.log("Setting custom claims...");
      await auth.setCustomUserClaims(user?.uid, {
        role: "admin",
      });

      console.log("Done!");

      rl.close();
      process.exit();
    });
  });
});
