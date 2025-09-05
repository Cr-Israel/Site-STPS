// API Configuration
const API_CONFIG = {
    // Replace with your actual API endpoint
    BASE_URL: 'https://localhost:3333',
    // BASE_URL: 'https://site-stps-back.onrender.com',
    
    // API endpoints
    ENDPOINTS: {
        REGISTER: '/form-submit',
    },
    
    // Headers for API requests
    HEADERS: {
        'Content-Type': 'application/json',
        // Add any authentication headers if needed
        // 'Authorization': 'Bearer your-token-here',
        // 'X-API-Key': 'your-api-key-here'
    },
    
    // Timeout for API requests (in milliseconds)
    TIMEOUT: 10000,
    
    // Retry configuration
    RETRY: {
        MAX_ATTEMPTS: 3,
        DELAY: 1000
    }
};

// Environment-specific configurations
const ENVIRONMENT = {
    DEVELOPMENT: {
        API_URL: 'http://localhost:3333',
        DEBUG: true
    },
    PRODUCTION: {
        // API_URL: 'https://site-stps-back.onrender.com',
        API_URL: 'http://localhost:3333',
        DEBUG: false
    }
};

// Get current environment (you can set this based on your deployment)
const CURRENT_ENV = window.location.hostname === 'localhost' ? 'DEVELOPMENT' : 'PRODUCTION';
const API_BASE_URL = ENVIRONMENT[CURRENT_ENV].API_URL || API_CONFIG.BASE_URL;
