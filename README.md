# Re-Give-Project
Re-Give Project Description






const cookieParser = require('cookie-parser');
const express = require('express');
const path = require('path');
const app = express();
const user = require('./models/user'); // Importing the user model

const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/user')

app.use(cookieParser());
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());



app.get('/', (req, res) => {
  res.cookie("name","Sahil")
  res.render('project');
});

app.get('/user', (req, res) => {

  res.render('login')});

// app.get('/signup', async (req, res) => {

//     const { username, email, password, confirmPassword } = req.body;
   
//     let createduser = await user.create({
//       username,
//       email,
//       password,
//       confirmPassword,
//       checkbox: req.body.checkbox === 'on' 
//     });
//     res.send(createduser);
//     res.rendd('/');
//     createduser.save();
//     console.log(createduser)
    
//   })

// app.get('/submit', async (req, res) => {
//     const { name, email, phone, pickup, other_location } = req.body;
//     let m= await user.create({
//         items: items,
//         name: name,
//         email: email, 
//         pickup: pickup,
//         other_location: other_location,
//         phone: phone
//     });
//     res.send(m);
//     m.save();
//     console.log(m);
//     res.render('project');
// });


app.listen( 3000, () => {
  console.log('Server running at http://localhost:3000');
});














        <!-- <a href="/requests" class="block p-6 bg-blue-100 rounded-2xl hover:bg-blue-200 transition">
          <h3 class="text-lg font-semibold text-blue-700">View Requests</h3>
          <p class="text-gray-600 text-sm mt-2">
            Check requests from students/NGOs who need donations.
          </p>
        </a>
        
        <a href="/my-donations" class="block p-6 bg-purple-100 rounded-2xl hover:bg-purple-200 transition">
          <h3 class="text-lg font-semibold text-purple-700">My Donations</h3>
          <p class="text-gray-600 text-sm mt-2">
            View and manage the items you have donated.
        </p>
        </a>

         <a href="/profile" class="block p-6 bg-yellow-100 rounded-2xl hover:bg-yellow-200 transition" onclick="goToProfile">
          <h3 class="text-lg font-semibold text-yellow-700" >My Profile</h3>
          <p class="text-gray-600 text-sm mt-2">
          View and edit your profile information.
          </p>
        </a> -->