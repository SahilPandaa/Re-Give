document.addEventListener('DOMContentLoaded', () => {
    const volunteerForm = document.getElementById('volunteerForm');
    if (volunteerForm) {
        volunteerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Thank you for your application! We will contact you soon.');
            this.reset();
        });
    }

    const donateBtn = document.querySelector('.donation-box button');
    const donateForm = document.querySelector('.donation-box form');
    if (donateBtn && donateForm) {
        donateBtn.addEventListener('click', function(e) {
            e.preventDefault();
            alert('Thank you for your donation pledge! Our team will contact you for collection details.');
            donateForm.reset();
        });
    }

    const eventButtons = document.querySelectorAll('.event-details .btn');
    eventButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const eventName = this.closest('.event-details').querySelector('h3').textContent;
            alert(`Thank you for your interest in "${eventName}". Registration details will be emailed to you.`);
        });
    });

    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    const amountOptions = document.querySelectorAll('.amount-option');
    amountOptions.forEach(option => {
        option.addEventListener('click', function() {
            amountOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
        });
    });

    const pickup = document.getElementById("pickup");
    const other = document.getElementById("other");

    if (pickup && other) {
        pickup.onchange = function() {
            if (pickup.value === "other") {
                other.style.display = "inline";
            } else {
                other.style.display = "none";
            }
        };
    }

    console.log("✅ Script loaded and working!");



    const loginLink = document.querySelector('.login');
    if (loginLink) {
        loginLink.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = '/login';
        });
    }

    document.querySelectorAll('.dashboard').forEach(link => {
        link.addEventListener('click', function(e) {
            // e.preventDefault();   <-- REMOVE THIS IF YOUR <a> ALREADY HAS href="/dashboard"
            window.location.href = '/dashboard';
        });
    });


    const logoutLink = document.querySelector('.logout');
    if (logoutLink) {
        logoutLink.addEventListener('click', async function(e) {
            e.preventDefault();
            // Sign out from Firebase
            const auth = firebase.auth();
            await auth.signOut();
            // Clear cookie in backend
            await fetch('/logout');
            window.location.href = '/login';
        });
    }

});