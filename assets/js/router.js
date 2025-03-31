// Router for handling URL paths
function handleRouting() {
    const path = window.location.pathname;
    
    // Remove trailing slash if present
    const cleanPath = path.replace(/\/$/, '');
    
    // Handle different routes
    switch(cleanPath) {
        case '/home':
        case '/home/':
            window.location.href = '/home.html';
            break;
        case '/ollama':
        case '/ollama/':
            window.location.href = '/ollama.html';
            break;
        default:
            // If no match, do nothing
            break;
    }
}

// Run routing check when page loads
document.addEventListener('DOMContentLoaded', handleRouting); 