 // Simple form submission handlers
        document.getElementById('volunteerForm').addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Thank you for your application! We will contact you soon.');
            this.reset();
        });
        
        // Donation form submission
        document.querySelector('.donation-box button').addEventListener('click', function(e) {
            e.preventDefault();
            alert('Thank you for your donation pledge! Our team will contact you for collection details.');
            document.querySelector('.donation-box form').reset();
        });
        
        // Event registration buttons
        document.querySelectorAll('.event-details .btn').forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                const eventName = this.closest('.event-details').querySelector('h3').textContent;
                alert(`Thank you for your interest in "${eventName}". Registration details will be emailed to you.`);
            });
        });
        
        // Smooth scrolling for navigation
        document.querySelectorAll('nav a').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                document.querySelector(this.getAttribute('href')).scrollIntoView({
                    behavior: 'smooth'
                });
            });
        });
        
        // Toggle active class for donation amount options
        document.querySelectorAll('.amount-option').forEach(option => {
            option.addEventListener('click', function() {
                document.querySelectorAll('.amount-option').forEach(opt => opt.classList.remove('active'));
                this.classList.add('active');
            });
        });
        // let X = document.getElementById("other1");
        // let a = document.createElement("input").element.classList.add("Sahil");

        // if(X==true){
        //     X.append(a);
        // }

        //For other box
        const a = document.getElementById("pickup");    
        const b = document.getElementById("Other1");    

        a.onchange = function() {
             if (a.value === "other") {                    
            b.style.display = "inline";
             } else {
            b.style.display = "none";                 
            }
        };
   