// app.js
// -------------------- IMPORTS --------------------
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import "dotenv/config";
import fs from "fs";
import admin from "firebase-admin";
import { Donation } from "./models/Donation.js";

// -------------------- BASIC SETUP --------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express(); // create express app

// -------------------- FIREBASE ADMIN SETUP --------------------
// Load service account key for Firebase Admin SDK
const serviceAccount = JSON.parse(
  fs.readFileSync(path.join(__dirname, "serviceAccountKey.json"), "utf8")
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// -------------------- MONGODB CONNECTION --------------------
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => {
    console.error("❌ Could not connect to MongoDB:", err.message);
    process.exit(1); // Stop app if DB is not connected
  });

// -------------------- MIDDLEWARE --------------------
app.use(cookieParser()); // parse cookies
app.use(express.json()); // parse JSON data
app.use(express.urlencoded({ extended: true })); // parse form data
app.use(express.static(path.join(__dirname, "public")));
 // serve static files (css, js, images)

app.set("view engine", "ejs"); // use EJS as view engine
app.set("views", path.join(__dirname, "views")); // where ejs files are located

// -------------------- FIREBASE AUTH MIDDLEWARE --------------------
// This middleware runs on every request and checks if user is logged in
app.use(async (req, res, next) => {
  const token = req.cookies?.token; // get token from cookies
  if (!token) return next(); // no token means user is not logged in

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken; // save user data to req.user
  } catch (error) {
    console.error("Invalid token:", error.message);
    res.clearCookie("token"); // clear token if invalid
    req.user = null;
  }
  next();
});

// This function is used for routes that need login
function requireAuth(req, res, next) {
  if (!req.user) return res.redirect("/login");
  next();
}

// -------------------- ROUTES --------------------

// Login page
app.get("/login", (req, res) => {
  if (req.user) return res.redirect("/");
  res.render("login", {
    firebaseConfig: {
      apiKey: process.env.FIREBASE_API_KEY,
      authDomain: process.env.FIREBASE_AUTH_DOMAIN,
      projectId: process.env.FIREBASE_PROJECT_ID,
    },
  });
});

// Signup page
app.get("/signup", (req, res) => {
  if (req.user) return res.redirect("/");
  res.render("signup", {
    firebaseConfig: {
      apiKey: process.env.FIREBASE_API_KEY,
      authDomain: process.env.FIREBASE_AUTH_DOMAIN,
      projectId: process.env.FIREBASE_PROJECT_ID,
    },
  });
});

// Set token after login
app.post("/set-token", (req, res) => {
  if (!req.body.token) return res.status(400).json({ error: "No token provided" });

  res.cookie("token", req.body.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  res.json({ message: "Token saved successfully" });
});

// Logout
app.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/login");
});

// Home page (protected)
app.get("/", requireAuth, (req, res) => {
  res.render("project", { user: req.user });
});

// Dashboard (protected)
app.get("/dashboard", requireAuth, (req, res) => {
  res.render("dashboard", { user: req.user });
});


// Donate page (protected)
app.get("/donate", requireAuth, (req, res) => {
  res.render("donate", { user: req.user });
});

// Handle donation form submit
app.post("/donate", requireAuth, async (req, res) => {
  try {
    const donation = new Donation(req.body); // create new donation
    await donation.save(); // save to database
    console.log("Donation saved:", donation);
    res.redirect("/dashboard?success=true");
  } catch (err) {
    console.error("Error saving donation:", err);
    res.redirect("/dashboard?success=false");
  }
});

// -------------------- START SERVER --------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
