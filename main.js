// -------------------- IMPORTS --------------------
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import "dotenv/config";
import fs from "fs";
import admin from "firebase-admin";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";
import methodOverride from "method-override";


// -------------------- MODELS --------------------
import { Donation } from "./models/Donation.js";
import User from "./models/User.js";
import { JoinTeam } from "./models/joinTeam.js";
import { Donated } from "./models/Donated.js";
import BeneficiaryDB from "./models/Beneficiary.js";
import Event from "./models/Event.js";
import Registration from "./models/Registration.js";


// -------------------- BASIC SETUP --------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 3000;


// -------------------- FIREBASE ADMIN  --------------------
let serviceAccount;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  // Running on Render / Cloud (escaped \n)
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

  // Fix escaped newlines
  serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");

  console.log("🔥 Using FIREBASE_SERVICE_ACCOUNT from environment");
} else if (fs.existsSync("serviceAccountKey.json")) {
  // Running locally
  serviceAccount = JSON.parse(fs.readFileSync("serviceAccountKey.json", "utf8"));
  console.log("🔥 Using local serviceAccountKey.json");
} else {
  console.error("❌ No Firebase service account found!");
}

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  console.log("✅ Firebase Admin initialized");
} catch (err) {
  console.error("❌ Firebase Admin init failed:", err);
}


// -------------------- CLOUDINARY CONFIG --------------------
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


// -------------------- MULTER CONFIG --------------------
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: "ReGive_Donations",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    public_id: `${Date.now()}-${file.originalname.split(".")[0]}`,
  }),
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter(req, file, cb) {
    if (!file.mimetype.startsWith("image/")) {
      cb(new Error("Only image files are allowed!"));
    } else {
      cb(null, true);
    }
  },
});


// -------------------- MONGODB CONNECTION --------------------
mongoose
  .connect(process.env.MONGO_URI, {
    // options can be added if needed
  })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });


// -------------------- MIDDLEWARE --------------------
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));


// -------------------- AUTH MIDDLEWARE --------------------
app.use(async (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) return next();

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded; // attach decoded token to req.user
  } catch (error) {
    console.warn("Invalid/expired token:", error.message);
    res.clearCookie("token");
    req.user = null;
  }
  next();
});

function requireAuth(req, res, next) {
  if (!req.user) return res.redirect("/login");
  next();
}

async function requireAdminAuth(req, res, next) {
  try {
    const sessionCookie = req.cookies?.token;
    if (!sessionCookie) return res.redirect("/login");

    const decoded = await admin.auth().verifyIdToken(sessionCookie);
    // custom claims applied via admin.auth().setCustomUserClaims will appear on decoded
    const isAdmin = decoded?.admin || decoded?.customClaims?.admin || false;

    if (!isAdmin) return res.status(403).send("Access denied. Admins only.");

    // Keep both req.user and req.admin if needed
    req.user = decoded;
    req.admin = decoded;
    next();
  } catch (err) {
    console.error("❌ Admin auth failed:", err.message);
    res.redirect("/login");
  }
}


// -------------------- ROUTES --------------------

// ---------- AUTH ROUTES ----------
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

app.post("/set-token", (req, res) => {
  const token = req.body.token;
  if (!token) return res.status(400).json({ error: "No token provided" });

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
  res.json({ message: "Token saved successfully" });
});

app.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/login");
});


// ---------- USER ROUTES ----------
app.get("/", requireAuth, async (req, res) => {
  try {
    // Fetch all events from MongoDB (sorted latest first)
    const events = await Event.find().sort({ _id: -1 });

    // Render EJS with events and user
    res.render("project", { user: req.user, events });
  } catch (err) {
    console.error("Error fetching events:", err);
    res.render("project", { user: req.user, events: [] });
  }
});

app.get("/dashboard", requireAuth, (req, res) => {
  // If admin logs in, redirect to admin dashboard
  if (req.user?.admin || req.user?.customClaims?.admin) return res.redirect("/admin/dashboard");
  res.render("dashboard", { user: req.user });
});

app.get("/donate", requireAuth, (req, res) => {
  res.render("donate", { user: req.user });
});

app.post("/donate", requireAuth, upload.array("donation_image", 5), async (req, res) => {
  try {
    const {
      items,
      other_items,
      donor_name,
      donor_email,
      donor_contact,
      pickup,
      other_location,
    } = req.body;

    if (!donor_email || !/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(donor_email))
      return res.redirect("/dashboard?success=false&error=invalid_email");

    const imageUrls = (req.files || []).map((f) => f.path);
    if (!imageUrls.length)
      return res.redirect("/dashboard?success=false&error=no_image");

    const newDonation = new Donation({
      items: Array.isArray(items) ? items : items ? [items] : [],
      other_items,
      donor_name,
      donor_email,
      donor_contact,
      pickup,
      other_location,
      images: imageUrls,
    });

    await newDonation.save();
    console.log("✅ Donation saved:", newDonation._id);
    res.redirect("/dashboard?success=true");
  } catch (err) {
    console.error("Error saving donation:", err.message);
    res.redirect("/dashboard?success=false");
  }
});

app.get("/my-donations", requireAuth, async (req, res) => {
  try {
    const donations = await Donation.find({ donor_email: req.user.email }).sort({ createdAt: -1 });
    res.render("my-donations", { user: req.user, donations });
  } catch (err) {
    console.error("Error fetching donations:", err);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/profile", requireAuth, async (req, res) => {
  try {
    let user = await User.findOne({ firebase_uid: req.user.uid });
    if (!user) {
      user = await User.create({
        firebase_uid: req.user.uid,
        email: req.user.email,
      });
    }
    res.render("profile", { user });
  } catch (err) {
    console.error("Error loading profile:", err);
    res.status(500).send("Server Error");
  }
});

app.post("/profile", requireAuth, async (req, res) => {
  try {
    const { name, contact } = req.body;
    await User.findOneAndUpdate(
      { firebase_uid: req.user.uid },
      { name, contact },
      { new: true, upsert: true }
    );
    res.redirect("/profile?updated=true");
  } catch (err) {
    console.error("Error updating profile:", err);
    res.redirect("/profile?updated=false");
  }
});

app.post("/join-team", async (req, res) => {
  try {
    const { name, email, phone, department, year, interest, message } = req.body;
    const newMember = new JoinTeam({
      name,
      email,
      phone,
      department,
      year,
      interest,
      message,
    });
    await newMember.save();
    res.status(200).json({ success: true, message: "Application submitted successfully!" });
  } catch (err) {
    console.error("Error saving join team:", err);
    res.status(500).json({ success: false, message: "Error submitting application." });
  }
});

// ✅ User event registration route
app.post("/user/register-event", async (req, res) => {
  try {
    const { eventId, name, contact, email } = req.body;

    // Basic validation
    if (!eventId || !name || !contact || !email) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    // Optional Gmail validation
    if (!/^[^\s@]+@gmail\.com$/.test(email)) {
      return res.status(400).json({ success: false, message: "Please use a valid Gmail address" });
    }

    // ✅ Create new registration in a separate collection
    const registration = new Registration({
      eventId,
      name,
      contact,
      email,
    });

    await registration.save();

    return res.json({ success: true, message: "Registered successfully" });
  } catch (err) {
    console.error("❌ /user/register-event error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


// ---------- ADMIN ROUTES ----------
// Admin Dashboard
app.get("/admin/dashboard", requireAdminAuth, async (req, res) => {
  try {
    // ✅ Get all users from Firebase Auth (paginated)
    const listAllUsers = async (nextPageToken, users = []) => {
      const result = await admin.auth().listUsers(1000, nextPageToken);
      users.push(...result.users);
      if (result.pageToken) return listAllUsers(result.pageToken, users);
      return users;
    };

    const firebaseUsers = await listAllUsers();
    const totalUsers = firebaseUsers.length;

    // ✅ MongoDB data
    const totalDonations = await Donation.countDocuments();
    const totalVolunteers = await JoinTeam.countDocuments();

    // ✅ Render dashboard
    res.render("admin/dashboard", {
      admin: req.user,
      totalDonations,
      totalVolunteers,
      totalUsers,
    });
  } catch (err) {
    console.error("❌ Error loading admin dashboard:", err);
    res.status(500).send("Error loading dashboard");
  }
});

app.delete("/admin/users/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ Check if it's a Firebase UID or MongoDB ObjectId
    if (mongoose.Types.ObjectId.isValid(id)) {
      // In case you ever have users in MongoDB
      await User.findByIdAndDelete(id);
      console.log(`🗑️ Deleted MongoDB user (ID: ${id})`);
    } else {
      // ✅ Firebase user delete
      await admin.auth().deleteUser(id);
      console.log(`🗑️ Deleted Firebase user (UID: ${id})`);
    }

    res.redirect("/admin/users?msg=User deleted successfully");
  } catch (err) {
    console.error("❌ Error deleting user:", err);
    res.status(500).send("Error deleting user");
  }
});


app.get("/admin/donations", requireAdminAuth, async (req, res) => {
  try {
    const donations = await Donation.find().sort({ createdAt: -1 });
    // Use req.user (initialized by requireAdminAuth) for admin info
    res.render("admin/donations", { admin: req.user, donations });
  } catch (err) {
    console.error("Error fetching donations:", err);
    res.status(500).send("Server Error");
  }
});

// ✅ ADMIN: MARK DONATION AS COLLECTED
app.post("/admin/donations/:id/status", requireAdminAuth, async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) return res.status(404).send("Donation not found");

    // ✅ Save the donation in the Donated collection
    const collected = new Donated({
      donor_name: donation.donor_name,
      donor_email: donation.donor_email,
      donor_contact: donation.donor_contact,
      pickup: donation.pickup,
      items: donation.items,
      other_items: donation.other_items,
      images: donation.images,
    });

    await collected.save();

    // 🧹 Delete the original record from Donation collection
    await Donation.findByIdAndDelete(req.params.id);

    console.log(`✅ Donation ${req.params.id} moved to Donated collection`);

    res.redirect("/admin/donations?msg=Donation+marked+as+collected");
  } catch (err) {
    console.error("❌ Error marking as collected:", err);
    res.status(500).send("Error marking donation as collected");
  }
});

// DELETE Donation
app.delete("/admin/donations/:id", requireAdminAuth, async (req, res) => {
  try {
    await Donation.findByIdAndDelete(req.params.id);
    console.log("🗑️ Donation deleted:", req.params.id);
    res.redirect("/admin/donations"); // redirect back to list page
  } catch (err) {
    console.error("❌ Error deleting donation:", err);
    res.status(500).send("Error deleting donation");
  }
});

// -------------------- ADMIN: VIEW JOIN REQUESTS --------------------
app.get("/admin/join-team", requireAdminAuth, async (req, res) => {
  try {
    const requests = await JoinTeam.find().sort({ createdAt: -1 });
    res.render("admin/joinTeam", { requests });
  } catch (err) {
    console.error("❌ Error loading join requests:", err);
    res.status(500).send("Error loading join requests");
  }
});

// -------------------- ADMIN: APPROVE REQUEST (PROMOTE TO ADMIN) --------------------
app.post("/admin/join-team/:id/approve", requireAdminAuth, async (req, res) => {
  try {
    const joinRequest = await JoinTeam.findById(req.params.id);
    if (!joinRequest) return res.status(404).send("Join request not found");

    // 🔥 Promote user to admin in Firebase
    const userRecord = await admin.auth().getUserByEmail(joinRequest.email);
    await admin.auth().setCustomUserClaims(userRecord.uid, { admin: true });

    console.log(`✅ ${joinRequest.email} promoted to admin`);

    // 🧹 Remove the approved request from database
    await JoinTeam.findByIdAndDelete(req.params.id);

    // ✅ Redirect back to the join-team page
    res.redirect("/admin/join-team");
  } catch (err) {
    console.error("❌ Approve error:", err);
    res.status(500).send("Error approving request");
  }
});

// -------------------- ADMIN: REJECT REQUEST --------------------
app.post("/admin/join-team/:id/reject", requireAdminAuth, async (req, res) => {
  try {
    await JoinTeam.findByIdAndUpdate(req.params.id, { status: "Rejected" });
    res.redirect("/admin/join-team?rejected=true");
  } catch (err) {
    console.error("❌ Error rejecting request:", err);
    res.status(500).send("Error rejecting request");
  }
});

// -------------------- ADMIN: DELETE REQUEST --------------------
app.delete("/admin/join-team/:id", requireAdminAuth, async (req, res) => {
  try {
    await JoinTeam.findByIdAndDelete(req.params.id);
    res.redirect("/admin/join-team?deleted=true");
  } catch (err) {
    console.error("❌ Error deleting request:", err);
    res.status(500).send("Error deleting request");
  }
});

// -------------------- ADMIN: MANAGE USERS --------------------
// -------------------- ADMIN: LIST ALL USERS --------------------
app.get("/admin/users", requireAdminAuth, async (req, res) => {
  try {
    const listUsersResult = await admin.auth().listUsers();

    const users = listUsersResult.users.map((user) => ({
      uid: user.uid,
      email: user.email,
      name: user.displayName || "N/A",
      phone: user.phoneNumber || "-",
      createdAt: new Date(user.metadata.creationTime).toLocaleDateString(),
      isAdmin: user.customClaims?.admin || false, // Check if user has admin claim
    }));

    res.render("admin/users", { users });
  } catch (err) {
    console.error("❌ Error fetching Firebase users:", err);
    res.status(500).send("Error loading users");
  }
});

// -------------------- ADMIN: DELETE USER --------------------
app.delete("/admin/users/:id", requireAdminAuth, async (req, res) => {
  try {
    const userId = req.params.id;

    // 1️⃣ Delete from MongoDB (JoinTeam or User collection)
    const deletedUser = await JoinTeam.findByIdAndDelete(userId);
    if (!deletedUser) {
      console.log("⚠️ User not found in MongoDB");
      return res.status(404).send("User not found");
    }

    // 2️⃣ Try to delete from Firebase (optional)
    try {
      const userRecord = await admin.auth().getUserByEmail(deletedUser.email);
      await admin.auth().deleteUser(userRecord.uid);
      console.log(`✅ Deleted Firebase user: ${deletedUser.email}`);
    } catch (firebaseErr) {
      console.warn(`⚠️ Firebase user not found for: ${deletedUser.email}`);
    }

    // 3️⃣ Redirect back to user management page
    res.redirect("/admin/users");
  } catch (err) {
    console.error("❌ Error deleting user:", err);
    res.status(500).send("Error deleting user");
  }
});

// -------------------- ADMIN: PROMOTE USER --------------------
app.post("/admin/users/:uid/promote", requireAdminAuth, async (req, res) => {
  try {
    const userId = req.params.uid;
    await admin.auth().setCustomUserClaims(userId, { admin: true });
    console.log(`✅ ${userId} promoted to admin`);
    res.redirect("/admin/users?msg=User+promoted+to+admin");
  } catch (err) {
    console.error("❌ Error promoting user:", err);
    res.redirect("/admin/users?msg=Error+promoting+user");
  }
});

// -------------------- VIEW ADMINS --------------------
app.get("/admin/admins", requireAdminAuth, async (req, res) => {
  try {
    // 🧩 1️⃣ Fetch users marked as admin in MongoDB
    const mongoAdmins = await JoinTeam.find({ role: "admin" }).lean();

    // 🧩 2️⃣ Fetch Firebase admins
    const firebaseAdmins = [];
    const listUsers = async (nextPageToken) => {
      const result = await admin.auth().listUsers(1000, nextPageToken);
      result.users.forEach((user) => {
        if (user.customClaims && user.customClaims.admin) {
          firebaseAdmins.push({
            name: user.displayName || "Firebase Admin",
            email: user.email,
            role: "admin",
          });
        }
      });
      if (result.pageToken) await listUsers(result.pageToken);
    };

    await listUsers();

    // 🧩 3️⃣ Merge both sources, removing duplicates
    const allAdmins = [...mongoAdmins, ...firebaseAdmins].filter(
      (v, i, a) => a.findIndex((t) => t.email === v.email) === i
    );

    res.render("admin/adminList", { admins: allAdmins });
  } catch (err) {
    console.error("❌ Error loading admins:", err);
    res.status(500).send("Error loading admins");
  }
});

// ✅ Show all donated (collected) items
app.get("/admin/collected-items", requireAdminAuth, async (req, res) => {
  try {
    const donatedItems = await Donated.find().sort({ collectedAt: -1 });
    res.render("admin/collected-items", { donatedItems });
  } catch (err) {
    console.error("Error fetching donated items:", err);
    res.status(500).send("Error fetching collected items");
  }
});

// ✅ 2. Handle “Mark as Donated” + Beneficiary Form submission (Fixed)
const uploadNone = multer().none();

app.post("/admin/markAsDonated", requireAdminAuth, uploadNone, async (req, res) => {
  try {
    console.log("📩 Received request to mark as donated");

    const { donatedItemId, name, contact, address } = req.body;

    if (!donatedItemId || !name || !address) {
      console.log("⚠️ Missing required fields");
      return res
        .status(400)
        .json({ message: "Name, address, and donatedItemId are required." });
    }

    // ✅ Fetch the donation item
    const donatedItem = await Donated.findById(donatedItemId);
    if (!donatedItem) {
      console.log("❌ Donation not found for ID:", donatedItemId);
      return res.status(404).json({ message: "Donation not found." });
    }

    // ✅ Create Beneficiary Entry
    const beneficiary = new BeneficiaryDB({
      name,
      contact,
      address,
      donor_name: donatedItem.donor_name,
      donor_email: donatedItem.donor_email,
      donor_contact: donatedItem.donor_contact,
      pickup: donatedItem.pickup,
      items: donatedItem.items,
      other_items: donatedItem.other_items,
      images: donatedItem.images,
      collectedAt: donatedItem.collectedAt,
      donatedAt: new Date(),
    });

    await beneficiary.save();

    // ✅ Remove the original donation entry
    await Donated.findByIdAndDelete(donatedItemId);

    res.status(200).json({ message: "Item marked as donated successfully." });
  } catch (err) {
    console.error("❌ Error marking donated:", err);
    res
      .status(500)
      .json({ message: "Error saving beneficiary data.", error: err.message });
  }
});

// beneficiary list
app.get("/admin/beneficiary", requireAdminAuth, async (req, res) => {
  try {
    const beneficiaries = await BeneficiaryDB.find().sort({ donatedAt: -1 });
    res.render("admin/beneficiary", { beneficiaries });
  } catch (err) {
    console.error("Error loading beneficiary page:", err);
    res.status(500).send("Internal Server Error");
  }
});

// ✅ Render Add Event Page
app.get("/admin/add-event", requireAdminAuth, (req, res) => {
  res.render("admin/add-event");
});

// ✅ Handle Event Form Submission
app.post("/admin/add-event", requireAdminAuth, upload.single("image"), async (req, res) => {
  try {
    const { title, date, description, buttonText } = req.body;

    if (!req.file) {
      console.log("⚠️ No image uploaded");
      return res.redirect("/admin/add-event?msg=Please upload an image");
    }

    const imageUrl = req.file.path; // Cloudinary URL

    const newEvent = new Event({
      title,
      date,
      description,
      imageUrl,
      buttonText,
    });

    await newEvent.save();
    console.log("✅ Event saved:");
    res.redirect("/admin/add-event?msg=Event added successfully!");
  } catch (err) {
    console.error("❌ Error adding event:", err);
    res.redirect("/admin/add-event?msg=Failed to add event");
  }
});

// ✅ Admin - Ongoing Events (show all for now)
app.get("/admin/ongoing-events", requireAdminAuth, async (req, res) => {
  try {
    const events = await Event.find(); // <-- show all events
    res.render("admin/ongoing-events", { events });
  } catch (err) {
    console.error("Error fetching ongoing events:", err);
    res.render("admin/ongoing-events", { events: [] });
  }
});

// ✅ View participants of a specific event
app.get("/admin/event/:eventId/participants", requireAdminAuth, async (req, res) => {
  try {
    const { eventId } = req.params;
    const participants = await Registration.find({ eventId }).lean();

    res.json({
      success: true,
      participants
    });
  } catch (err) {
    console.error("Error fetching participants:", err);
    res.status(500).json({
      success: false,
      message: "Server error while fetching participants."
    });
  }
});

app.delete("/admin/delete-event/:eventId", requireAdminAuth, async (req, res) => {
  try {
    const { eventId } = req.params;
    const deleted = await Event.findByIdAndDelete(eventId);

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    // Optionally delete associated registrations too:
    await Registration.deleteMany({ eventId });

    res.json({ success: true, message: "Event deleted successfully" });
  } catch (err) {
    console.error("Error deleting event:", err);
    res.status(500).json({ success: false, message: "Server error deleting event" });
  }
});


// -------------------- HEALTH CHECK & ERROR HANDLING --------------------
app.get("/_health", (req, res) => res.send("OK"));

app.use((req, res) => res.status(404).send("Not Found"));

app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err);
  res.status(500).send("Server error");
});


// -------------------- START SERVER --------------------
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT} (PORT=${PORT})`));
