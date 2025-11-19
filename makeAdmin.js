// makeAdmin.js
import admin from "firebase-admin";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// resolve path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load your Firebase service account key
const serviceAccount = JSON.parse(
  fs.readFileSync(path.join(__dirname, "serviceAccountKey.json"), "utf8")
);

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

async function makeAdmin(uid) {
  try {
    await admin.auth().setCustomUserClaims(uid, { admin: true });
    console.log(`✅ User ${uid} is now an admin!`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Failed to set admin claim:", err);
    process.exit(1);
  }
}

// 👉 Replace this with your Firebase user's UID
makeAdmin("1fBLQaOZRzYIVm0jZZ5MXQfrj602");
