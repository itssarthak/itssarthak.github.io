// Handle routing before page load
(function() {
    const path = window.location.pathname;
    
    // Remove trailing slash if present
    const cleanPath = path.replace(/\/$/, '');
    
    // Handle different routes
    switch(cleanPath) {
        case '/home':
        case '/home/':
            window.location.replace(window.location.origin + '/home.html');
            break;
        case '/ollama':
        case '/ollama/':
            window.location.replace(window.location.origin + '/ollama.html');
            break;
        default:
            // If no match, do nothing
            break;
    }
})(); 