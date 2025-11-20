# Re-Give-Project
# 📦 Re-Give – NSS University Donation Management Platform

Re-Give is a full-stack donation management platform developed for our **University NSS Team**.  
It allows donors to easily contribute useful items by uploading images and details, and helps the NSS volunteers collect and distribute those items to people in need.

This platform improves transparency, organizes the donation process, and strengthens community service within the university.

---

## 🎯 Purpose

The main purpose of Re-Give is to support social welfare by:

- Helping **donors** contribute clothes, books, bags, accessories, and other items  
- Allowing **NSS volunteers** to track and collect donations efficiently  
- Ensuring that donated items reach the **correct beneficiaries**  
- Maintaining clear records of collected and distributed items  
- Managing **NSS events** and **volunteer registrations**  

Re-Give simplifies the entire donation workflow — from contribution to distribution.

---

## 🚀 Features

### 👤 Donor Features
- Donate items with **images** and detailed descriptions  
- Google Login using Firebase Authentication  
- View personal donation history  
- See upcoming NSS events  
- Apply to join the NSS volunteer team  

### 🧑‍🤝‍🧑 NSS Team / Admin Features
- Secure admin login using Firebase Admin SDK  
- View all donations made by donors  
- Mark donations as **collected**  
- Assign collected items to beneficiaries  
- Move items from *collected* → *donated*  
- View/manage volunteer join requests  
- Approve volunteers → promote to **admin**  
- Create and manage events  
- View participants of each event  
- Full user account management  

---

## 🧩 Tech Stack

- **Node.js** & **Express.js** – Backend server  
- **EJS** – Templating engine for frontend  
- **MongoDB Atlas** – Database  
- **Firebase Authentication** – User login  
- **Firebase Admin SDK** – Admin & role management  
- **Cloudinary** – Storage for donation images  
- **Multer** – File upload handling  
- **Render** – Cloud deployment (Backend)  

---

## 📂 Project Structure

Re-Give/
│── models/
│── public/
│── views/
│── main.js
│── package.json
│── .env
│── README.md


---


## 🌐 Live Demo

Experience the live running version of the project here:

🔗 **https://re-give.onrender.com**

The platform is fully deployed on **Render** and can be accessed from any device.



## ⚙️ Installation (For Developers)

### 1. Clone the project:
```bash
git clone https://github.com/SahilPandaa/Re-Give
cd Re-Give

 2. Install dependencies:

npm install

 3. Create a .env file and include:

MONGO_URI=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
FIREBASE_API_KEY=
FIREBASE_AUTH_DOMAIN=
FIREBASE_PROJECT_ID=
FIREBASE_SERVICE_ACCOUNT={...}

4. Start the server:

nodemon main.js

