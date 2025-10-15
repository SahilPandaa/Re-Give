 function switchTab(tabName) {
            // Update tab indicator
            document.querySelector('.tab-indicator').style.transform = 
                tabName === 'login' ? 'translateX(0)' : 'translateX(100%)';
            
            // Update active tab
            document.querySelectorAll('.auth-tab').forEach(tab => {
                tab.classList.toggle('active', tab.textContent.toLowerCase().includes(tabName));
            });
            
            // Update active content
            document.querySelectorAll('.auth-content').forEach(content => {
                content.classList.toggle('active', content.id.includes(tabName));
            });
        }
        
        function togglePassword(inputId) {
            const input = document.getElementById(inputId);
            const toggle = input.nextElementSibling.nextElementSibling;
            
            if (input.type === 'password') {
                input.type = 'text';
                toggle.textContent = 'Hide';
            } else {
                input.type = 'password';
                toggle.textContent = 'Show';
            }
        }
        
        function socialLogin(provider) {
            alert(`Implement ${provider} login functionality here`);
            // In a real app, you would redirect to the provider's auth endpoint
        }
        
        // Form submission handlers
        document.getElementById('login-form').addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            
            // Here you would typically make an API call to authenticate
            console.log('Login attempt with:', { email, password });
            // alert('Login form submitted (check console)');
        });
        
        document.getElementById('signup-form').addEventListener('submit', function(e) {
            e.preventDefault();
            const name = document.getElementById('signup-name').value;
            const email = document.getElementById('signup-email').value;
            const password = document.getElementById('signup-password').value;
            const confirmPassword = document.getElementById('signup-confirm-password').value;
            
            // Validate password match
            if (password !== confirmPassword) {
                alert('Passwords do not match!');
                return;
            }
            
            // Here you would typically make an API call to register
            console.log('Signup attempt with:', { name, email, password });
            // alert('Signup form submitted (check console)');
        });
        
        // Password strength indicator could be added here