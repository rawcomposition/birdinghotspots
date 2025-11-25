import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";

const keyId = "V8FLPW8727";
const teamId = "K9G8K92XCP";
const keyPath = path.join(process.cwd(), "AuthKey_V8FLPW8727.p8");

if (!fs.existsSync(keyPath)) {
  console.error(`Error: Key file not found at ${keyPath}`);
  console.log("\nPlease ensure your .p8 key file is accessible.");
  console.log("You can specify a custom path with MAPKIT_KEY_PATH environment variable.");
  process.exit(1);
}

try {
  const privateKey = fs.readFileSync(keyPath, "utf8");

  const token = jwt.sign({}, privateKey, {
    algorithm: "ES256",
    expiresIn: "365d",
    issuer: teamId,
    keyid: keyId,
  });

  console.log("\n✅ MapKit JWT Token generated successfully!\n");
  console.log("Add this to your .env file:");
  console.log("─────────────────────────────────────────────────────────");
  console.log(`NEXT_PUBLIC_MAPKIT_KEY=${token}`);
  console.log("─────────────────────────────────────────────────────────");
  console.log("\nNote: This token expires in 180 days. You'll need to regenerate it.");
  console.log("You can run this script again to generate a new token.\n");
} catch (error: any) {
  console.error("Error generating token:", error.message);
  process.exit(1);
}
