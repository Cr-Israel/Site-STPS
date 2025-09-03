// Toggle other function field
function toggleOtherFunction() {
    const functionSelect = document.getElementById('function');
    const otherFunctionGroup = document.getElementById('otherFunctionGroup');
    const otherFunctionInput = document.getElementById('otherFunction');
    
    if (functionSelect.value === 'Other') {
        otherFunctionGroup.style.display = 'block';
        otherFunctionInput.required = true;
    } else {
        otherFunctionGroup.style.display = 'none';
        otherFunctionInput.required = false;
        otherFunctionInput.value = '';
    }
}

// Form submission handling
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('registrationForm');
    const modal = document.getElementById('successModal');
    
    // Form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        
        // Validate form
        if (validateForm(data)) {
            // Simulate form submission (replace with actual API call)
            submitForm(data);
        }
    });
    
    // Form validation
    function validateForm(data) {
        let isValid = true;
        const errors = [];
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            errors.push('Email inválido');
            isValid = false;
        }
        
        // Name validation
        if (data.fullName.trim().length < 5) {
            errors.push('Nome precisa ter pelo menos 5 caracteres');
            isValid = false;
        }
        
        // Phone validation
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        const cleanPhone = data.phone.replace(/\D/g, '');
        if (cleanPhone.length < 10) {
            errors.push('Telefone precisa ter pelo menos 10 caracteres');
            isValid = false;
        }
        
        // Church validation
        if (data.church.trim().length < 5) {
            errors.push('Igreja precisa ter pelo menos 5 caracteres');
            isValid = false;
        }
        
        // Function validation
        if (!data.function) {
            errors.push('Selecione uma função');
            isValid = false;
        } else if (data.function === 'Other') {
            if (!data.otherFunction || data.otherFunction.trim().length < 3) {
                errors.push('Especifique sua função (mínimo 3 caracteres)');
                isValid = false;
            }
        }
        
        // Show errors if any
        if (!isValid) {
            showErrors(errors);
        }
        
        return isValid;
    }
    
    // Show validation errors
    function showErrors(errors) {
        // Remove existing error messages
        const existingErrors = document.querySelectorAll('.error-message');
        existingErrors.forEach(error => error.remove());
        
        // Create error container
        const errorContainer = document.createElement('div');
        errorContainer.className = 'error-container';
        errorContainer.style.cssText = `
            background: #FEE2E2;
            border: 1px solid #FCA5A5;
            border-radius: 8px;
            padding: 16px;
            margin-bottom: 20px;
            color: #DC2626;
        `;
        
        const errorTitle = document.createElement('h4');
        errorTitle.textContent = 'Por favor, corrija os seguintes erros:';
        errorTitle.style.marginBottom = '8px';
        errorContainer.appendChild(errorTitle);
        
        const errorList = document.createElement('ul');
        errorList.style.margin = '0';
        errorList.style.paddingLeft = '20px';
        
        errors.forEach(error => {
            const li = document.createElement('li');
            li.textContent = error;
            errorList.appendChild(li);
        });
        
        errorContainer.appendChild(errorList);
        
        // Insert error container before form
        form.parentNode.insertBefore(errorContainer, form);
        
        // Scroll to errors
        errorContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    
    // Submit form
    async function submitForm(data) {
        // Show loading state
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
        submitBtn.disabled = true;
        
        try {
            // API endpoint - replace with your actual API URL
            const apiUrl = `${API_BASE_URL}${API_CONFIG.ENDPOINTS.REGISTER}`;
            
            // Prepare data for API
            const apiData = {
                name: data.fullName,
                email: data.email,
                phone: data.phone,
                church: data.church,
                function: data.function === 'Other' ? data.otherFunction : data.function,
            };
            
            // Make API call with timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);
            
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: API_CONFIG.HEADERS,
                body: JSON.stringify(apiData),
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            
            // Reset button
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            
            // Show success modal
            showSuccessModal();
            
            // Reset form
            form.reset();
            
            // Remove any error messages
            const errorContainer = document.querySelector('.error-container');
            if (errorContainer) {
                errorContainer.remove();
            }
            
            // Log success (optional)
            console.log('Form submitted successfully:', result);
            
        } catch (error) {
            // Reset button
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            
            // Handle different types of errors
            let errorMessage = 'Erro desconhecido';
            
            if (error.name === 'AbortError') {
                errorMessage = 'Tempo limite excedido. Verifique sua conexão e tente novamente.';
            } else if (error.message.includes('HTTP error! status:')) {
                const status = error.message.split('status: ')[1];
                if (status === '400') {
                    errorMessage = 'Dados inválidos. Verifique as informações e tente novamente.';
                } else if (status === '409') {
                    errorMessage = 'Este email já está registrado.';
                } else if (status === '500') {
                    errorMessage = 'Erro interno do servidor. Tente novamente em alguns minutos.';
                } else {
                    errorMessage = `Erro do servidor (${status}). Tente novamente.`;
                }
            } else if (error.message.includes('Failed to fetch')) {
                errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
            }
            
            // Show error message
            showApiError(errorMessage);
            
            console.error('Error submitting form:', error);
        }
    }
    
    // Show API error
    function showApiError(errorMessage) {
        // Remove existing error messages
        const existingErrors = document.querySelectorAll('.error-container');
        existingErrors.forEach(error => error.remove());
        
        // Create error container
        const errorContainer = document.createElement('div');
        errorContainer.className = 'error-container';
        errorContainer.style.cssText = `
            background: #FEE2E2;
            border: 1px solid #FCA5A5;
            border-radius: 8px;
            padding: 16px;
            margin-bottom: 20px;
            color: #DC2626;
        `;
        
        const errorTitle = document.createElement('h4');
        errorTitle.textContent = 'Erro ao enviar inscrição';
        errorTitle.style.marginBottom = '8px';
        errorContainer.appendChild(errorTitle);
        
        const errorText = document.createElement('p');
        errorText.textContent = 'Ocorreu um erro ao processar sua inscrição. Por favor, tente novamente em alguns minutos ou entre em contato conosco.';
        errorText.style.margin = '0';
        errorContainer.appendChild(errorText);
        
        // Insert error container before form
        form.parentNode.insertBefore(errorContainer, form);
        
        // Scroll to errors
        errorContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    
    // Show success modal
    function showSuccessModal() {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
    
    // Close modal function (global for onclick)
    window.closeModal = function() {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    };
    
    // Close modal on outside click
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // Close modal on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.style.display === 'flex') {
            closeModal();
        }
    });
});

// Smooth scrolling for navigation links
document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetSection.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
});

// Mobile navigation toggle
document.addEventListener('DOMContentLoaded', function() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
        });
    }
});

// Header scroll effect
window.addEventListener('scroll', function() {
    const header = document.querySelector('.header');
    const scrollTop = window.pageYOffset;
    
    if (scrollTop > 100) {
        header.style.background = 'rgba(255, 255, 255, 0.98)';
        header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    } else {
        header.style.background = 'rgba(255, 255, 255, 0.95)';
        header.style.boxShadow = 'none';
    }
});

// Form field animations
document.addEventListener('DOMContentLoaded', function() {
    const formFields = document.querySelectorAll('.form-group input, .form-group select');
    
    formFields.forEach(field => {
        // Add focus effects
        field.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        
        field.addEventListener('blur', function() {
            if (!this.value) {
                this.parentElement.classList.remove('focused');
            }
        });
        
        // Add input effects
        field.addEventListener('input', function() {
            if (this.value) {
                this.parentElement.classList.add('has-value');
            } else {
                this.parentElement.classList.remove('has-value');
            }
        });
    });
});

// Intersection Observer for animations
document.addEventListener('DOMContentLoaded', function() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animateElements = document.querySelectorAll('.about-card, .contact-item, .form-container');
    animateElements.forEach(el => {
        observer.observe(el);
    });
});

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    .about-card, .contact-item, .form-container {
        opacity: 0;
        transform: translateY(30px);
        transition: opacity 0.6s ease, transform 0.6s ease;
    }
    
    .about-card.animate-in, .contact-item.animate-in, .form-container.animate-in {
        opacity: 1;
        transform: translateY(0);
    }
    
    .form-group.focused label {
        color: var(--primary-green);
    }
    
    .form-group.has-value label {
        color: var(--primary-green);
    }
    
    .nav-menu.active {
        display: flex !important;
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: var(--white);
        flex-direction: column;
        padding: 20px;
        box-shadow: var(--shadow-lg);
        border-top: 1px solid var(--gray-200);
    }
    
    .nav-toggle.active span:nth-child(1) {
        transform: rotate(45deg) translate(5px, 5px);
    }
    
    .nav-toggle.active span:nth-child(2) {
        opacity: 0;
    }
    
    .nav-toggle.active span:nth-child(3) {
        transform: rotate(-45deg) translate(7px, -6px);
    }
`;
document.head.appendChild(style);
