// Handle routing before page load with parameter preservation
(function() {
    const path = window.location.pathname;
    
    // Function to capture URL params and then redirect
    function redirectWithParamCapture(targetUrl) {
        // Capture parameters before redirect (fallback if URLParamsHandler not loaded yet)
        if (window.URLParamsHandler) {
            window.URLParamsHandler.redirect(targetUrl);
        } else {
            // Fallback: manually capture params
            const params = new URLSearchParams(window.location.search);
            if (params.toString()) {
                try {
                    const paramObj = {};
                    for (const [key, value] of params.entries()) {
                        paramObj[key] = value;
                    }
                    localStorage.setItem('urlParams', JSON.stringify({
                        params: paramObj,
                        timestamp: Date.now(),
                        url: window.location.href,
                        pathname: window.location.pathname
                    }));
                } catch (e) {
                    console.warn('Failed to store URL parameters:', e);
                }
            }
            window.location.replace(targetUrl);
        }
    }
    
    // Remove trailing slash if present
    const cleanPath = path.replace(/\/$/, '');
    
    // Handle different routes
    switch(cleanPath) {
        case '/home':
        case '/home/':
            redirectWithParamCapture(window.location.origin + '/home.html');
            break;
        case '/ollama':
        case '/ollama/':
            redirectWithParamCapture(window.location.origin + '/ollama.html');
            break;
        default:
            // If no match, still capture params if they exist
            if (window.location.search && window.URLParamsHandler) {
                window.URLParamsHandler.capture();
            }
            break;
    }
})(); 